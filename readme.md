# Code Examples

Thomas Stein - 8/20/2018


## How It Works

These scripts parse though a dat file which contains a database table. The tables are delimited by columns, but saved in a plain text format. So it is required to previously set up which line contains the table header in order for the script to parse the data correctly.

The script then goes line by line though the text file and splits the columns up according to their headers. Once the data has been sorted, it is then iterated though to evaluate the data parameters.


## weather.js

This script is designed to look through a dat file ```data_weather.dat``` and evaluate which day has the the lowest temperature variance.  This was my first attempt and it sorts every header parameter.

Run script in a terminal with Node.js:

	> node weather.js

Outputs:

	> Day 14 has the lowest temperature variance of 2


## soccer.js

This script is designed to look through a dat file ```data_soccer.dat``` and evaluate which team had the difference in goals scored for the team versus goals scored against the team. This was my second attempt, and i changed a few things. Foremost, it only sorts the required parameters.

Run script in a terminal with Node.js:

	> node soccer.js

Outputs:

	> Team Aston Villa has the lowest score difference of 1

