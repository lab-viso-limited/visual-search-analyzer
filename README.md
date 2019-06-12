# Visual Search Analyzer

## Introduction
A desktop application (Windows and MacOS compatible) for visualising the eyeball movement of the project [Visual Search Tracker project](https://www.labviso.com/#projects). The eyeball movement is captured by [Tobii Studio](https://www.tobiipro.com/). The algorithm to use for visualising the data is ST-DBSCAN. The desktop application is developed based on [NW.js](https://nwjs.io/).


## About ST-DBSCAN

ST-DBSCAN is a density-based clustering algorithm. The algorithm is in the file `src/js/app/visualSearchSTDBscan`. More about the algorithm, please see the article: [ST-DBSCAN: An algorithm for clustering spatial–temporal data](https://www.sciencedirect.com/science/article/pii/S0169023X06000218)


## Compile from Source Code

1. Download the package.

2. Use [Grunt](https://gruntjs.com) to compile: `grunt nwjs`

3. The desktop application will be in the folder `Release/2.0.0/osx64/Analyzer.app` and `Release/win64/Analyzer.exe`. Enjoy!



## Run from Pre-compiled Version

Simply download and run the program from https://www.labviso.com (for both MacOS and Windows).


## Sample Data

Sample data can be found from: `sample_data/vs_action.csv` and `sample/vs_eye_tracker.csv`.
