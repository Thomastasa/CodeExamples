// requires
const fs = require('fs')
const rl = require('readline')
const path = require('path')

// file specific variables
const file = path.join(__dirname, 'data_weather.dat')
const keyDay = 'Dy'
const keyTempMin = 'MnT'
const keyTempMax = 'MxT'
const headerLinePos = 4
let headerColumns = []

// variables
const regexWhitespace = /\w/

// generate header columns
function generateHeaderColumns(line){
  let columns = []
  let data = undefined
  let prevChar = ''
  for(let i=0; i < line.length; i++){
    let char = line.charAt(i)
    if(data == undefined){
      data = {
        key: char,
        start:i,
        end: i
      }
    }else{
      data.key += char
      data.end = i
    }
    if((prevChar.match(regexWhitespace) && !char.match(regexWhitespace)) || (i == line.length - 1)){
      data.key = data.key.trim()
      columns.push(data)
      data = undefined
    }
    prevChar = char
  }
  return columns
}

// generate line columns to match the header columns
function generateLineColumns(line){
  let columns = []
  for(let i=0; i < headerColumns.length; i++){
    let data = headerColumns[i]
    let endPos = (line.length - 1)
    const dataValid = (
      data != undefined &&
      typeof data.key == 'string' &&
      data.key.length > 0 &&
      !isNaN(data.start) &&
      !isNaN(data.end) &&
      endPos > -1 &&
      data.start < endPos &&
      data.end < endPos
    )
    if(dataValid){
        try{
          columns[data.key] = line.substring(data.start, data.end).trim()
        }catch(err){}
    }
  }
  return columns
}


// parse through a file to log the lowest temperature variance
function parseFile(){
  // init variables
  let currentLinePos = 0
  headerColumns = []
  let fileData = []

  const lineReader = rl.createInterface({
    input: fs.createReadStream(file)
  })

  lineReader.on('line', function(line){
    if(currentLinePos == headerLinePos){
      // set header column data
      headerColumns = generateHeaderColumns(line)
    }else if(currentLinePos > headerLinePos){
      // add line data matched to header columns
      fileData.push(generateLineColumns(line))
    }
    currentLinePos++
  })

  lineReader.on('close', function(){
    // after file is parsed, parse the data
    parseData()
  })

  function parseData(){
    let lowestTempPos = -1
    // loop through data to find lowest temp data position
    for(let i=0; i < fileData.length; i++){
      let data = fileData[i]
      // filter out only valid days
      const day = parseInt(data[keyDay])
      const validDay = (!isNaN(day) && day <= 31)
      if(validDay){
        // filter valid temp ranges
        const tempMin = parseInt(data[keyTempMin])
        const tempMax = parseInt(data[keyTempMax])
        const validTemp = (!isNaN(tempMin) && !isNaN(tempMax))
        if(validTemp){
          const tempSpread = (tempMax - tempMin)
          fileData[i].tempSpread = tempSpread
          // check if temp range is new lowest
          if(lowestTempPos == -1){
            lowestTempPos = i
          }else{
            const oldLowest = fileData[lowestTempPos].tempSpread
            if(tempSpread < oldLowest){
              lowestTempPos = i
            }
          }
        }
      }
    }
    let invalidData = true
    if(lowestTempPos > -1){
      const data = fileData[lowestTempPos]
      if(data != undefined){
        invalidData = false
        // log lowest temperature variance
        const logString = 'Day '+ data[keyDay] + ' has the lowest temperature variance of ' + data.tempSpread
        console.log(logString)
      }
    }
    if(invalidData){
      console.log('No Valid Temperature Data')
    }
  }

}

// on load parse the file listed at the top of the script
parseFile()
