var Time = {

  /**
   * @param time the time in a string format of hh:mm:ss.xxxx or hh:mm:ss:xxxx. Do nothing if time is numeric
   * @return milliseconds
   */
  parseInt: function(time){
    if(typeof(time) == "number"){
      return time;
    }

    var sec = 1000; // milliseconds
    var min = 60000;  // milliseconds
    var hour = 3600000;
    time = time.replace(".", ":").split(":");
    return time.length == 4 ? parseInt(time[0])*hour + parseInt(time[1])*min + parseInt(time[2])*sec + parseInt(time[3]) : null;
  },
  
  /**
   * @param time the time in millisecond
   * @return a string in the format of hh:mm:ss.xxxx and null if time is not number
   */
  parseStr: function(time){
    if(typeof(time) != "number"){
      return null;
    }
    var sec = 1000; // milliseconds
    var min = 60000;  // milliseconds
    var hour = 3600000;
    return Math.floor(time/hour)+":"+(Math.floor(time/min)%60)+":"+(Math.floor(time/sec)%60)+"."+(time%sec);
  },
  
  /**
   *
   */
  diff: function(timeStart, timeEnd){
    return Time.parseInt(timeEnd) - Time.parseInt(timeStart);
  }
}


var FileHandler = {

  /**
   * @require FileSaver.js for saving file in browser (not required for NW.js)
   */
  write: function(path, str, fileNameForJS){
    if(typeof(require) == "function"){
      var fs = require("fs");
      fs.writeFile(path, str, function(err){
        if(err){
          console.log("Error in FileHandler.writeFile() (code: -2)");
        }
      });
    }
    else if(typeof(saveAs) == "function"){
      var blob = new Blob([str], {type: "text/plain;charset=utf-8"});
      saveAs(blob, fileNameForJS);
    }
    else{
      console.log("Error in FileHandler.writeFile() (code: -3)");
    }
  }
}


/**
 */
var Geometry = {
  distance: function(x1, y1, x2, y2){
    return Math.sqrt(Math.twice(x1 - x2) + Math.twice(y1 - y2));
  },
  
  /**
   SSS - https://www.mathsisfun.com/algebra/trig-solving-sss-triangles.html
   
   Given three lengths a, b and c, get the Angle opposite of length a
   */
  getAngleByThreeSides: function(a, b, c){
    var angleA = Math.acos((b*b + c*c - a*a)/(2*b*c));
    return Geometry.radianToDegree(angleA);
  },
  
  /**
   */
  radianToDegree: function(radian){
    return radian * (180 / Math.PI);
  }
  
}

