// requires
const fs = require('fs')
const rl = require('readline')
const path = require('path')

// file specific variables
const file = path.join(__dirname, 'data_soccer.dat')
const keyTeam = 'Team'
const keyGoalsFor = 'F'
const keyGoalsAgainst = 'A'
const keyP = 'P'
const keyPts = 'Pts'
const headerLinePos = 2
let headerColumns = []

// variables
const regexDash = /-/g
const regexUnderscore = /_/g

// generate header columns
function generateHeaderColumns(line){
  const columns = [{
    key: keyTeam,
    start:  line.indexOf(keyTeam),
    end: (line.indexOf(keyP) - 1)
  },{
    key: keyGoalsFor,
    start: line.indexOf(keyGoalsFor),
    end: (line.indexOf(keyGoalsAgainst) - 1)
  },{
    key: keyGoalsAgainst,
    start: line.indexOf(keyGoalsAgainst),
    end: (line.indexOf(keyPts) - 1)
  }]
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
          columns[data.key] = line.substring(data.start, data.end).replace(regexDash,'').trim()
        }catch(err){}
    }
  }
  return columns
}


// parse through a file to log the lowest score variance
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
    let lowestScoreDiffPos = -1
    // loop through data to find lowest score difference data position
    for(let i=0; i < fileData.length; i++){
      let data = fileData[i]
      // filter out only valid teams
      const validTeam = (typeof data[keyTeam] == 'string' && data[keyTeam].length > 0)
      if(validTeam){
        // filter valid score ranges
        const scoreFor = parseInt(data[keyGoalsFor])
        const scoreAgainst = parseInt(data[keyGoalsAgainst])
        const validScores = (!isNaN(scoreFor) && !isNaN(scoreAgainst))
        if(validScores){
          let scoreDiff = (scoreFor - scoreAgainst)
          if(scoreDiff < 0){
            scoreDiff = scoreDiff * -1
          }
          fileData[i].scoreDiff = scoreDiff
          // check if score difference is new lowest
          if(lowestScoreDiffPos == -1){
            lowestScoreDiffPos = i
          }else{
            const oldLowest = fileData[lowestScoreDiffPos].scoreDiff
            if(scoreDiff < oldLowest){
              lowestScoreDiffPos = i
            }
          }
        }
      }
    }
    let invalidData = true
    if(lowestScoreDiffPos > -1){
      const data = fileData[lowestScoreDiffPos]
      if(data != undefined){
        invalidData = false
        // log lowest score difference
        const logString = 'Team '+ data[keyTeam].replace(regexUnderscore,' ') + ' has the lowest score difference of ' + data.scoreDiff
        console.log(logString)
      }
    }
    if(invalidData){
      console.log('No Valid Team Data')
    }
  }

}

// on load parse the file listed at the top of the script
parseFile()
