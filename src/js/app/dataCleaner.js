var dataCleaner = {
  
  /**
   *
   */
  cleanVisualSearchData: function(eyeData, actionData){
    allData = dataCleaner.fillMissingData(eyeData);
    if(allData == null){
      return null;
    }
    eyeData = allData.eyeData;

    var cleanData = [];
    var totalMissing = 0;
    var totalCaptured = 0;
    for(var i=0, k=0; i<actionData.length; i++){
      if(actionData[i][2]=="N"){
        if(actionData[i][1]=="calibrate"){
          i += 2;
        }
        else if(actionData[i][1]=="start"){
          i += 1;
        }
        var calibrate = actionData[i-2][0];
        var start = actionData[i-1][0];
        var answered = actionData[i][0];
        cleanData.push({calibrate:calibrate, start:start, end:answered, status:"discard", data:[]});
      }

      else{
        if(actionData[i][1]=="start" && actionData[i+1][2]!="N"){
          var group = [];
          var calibrate = actionData[i-1][0];
          var start = actionData[i][0];
          var answered = actionData[i+1][0];
          var missing = 0;

          for(; k<eyeData.length; k++){
            if(Time.diff(eyeData[k][0], start) <= 0){
              if(Time.diff(eyeData[k][0], answered) >= 0){
    
                // push one data point before the beginning of the experiment, i.e. in calibrate section
                if(group.length == 0){
                  group.push({
                    time: eyeData[k-1][0],
                    x: eyeData[k-1][1],
                    y: eyeData[k-1][2],
                    type: "Calibrate",
                    from: eyeData[k][4]
                  });
                }
                
                // push the current element
                group.push({
                  time: eyeData[k][0],
                  x: eyeData[k][1],
                  y: eyeData[k][2],
                  type: eyeData[k][3],
                  from: eyeData[k][4]
                });
                
                if(eyeData[k][4] == "missing"){
                  missing++;
                }
              }
              else{
                break;
              }
            }
          } // end for 

          cleanData.push({calibrate:calibrate, start:start, end:answered, status:"normal", data:group, numMissingPoints:missing});
          totalMissing += missing;
          totalCaptured += (group.length - missing);
          i++;
        }
      }
    }
    return {trial:cleanData, numMissingPoints:totalMissing, numCapturedPoints:totalCaptured};
  },
  
  
  /**
   After cleaning, the data return is in JSON:
  {
    numOfMissingPoints: (INT),
    numOfCapturedPoints: (INT),
    trial: [
      {
        start: (TIMESTAMP),
        end: (TIMESTAMP),
        data: [
          {
            time: (TIMESTAMP),
            type: ("SmoothPursuit"),
            x: (INT),
            y: (INT)
          }
        ],
      },
      .
      .
      .
    ]
   }
   */
  cleanSmoothPursuitData: function(eyeData, actionData, discardTime){
    allData = dataCleaner.fillMissingData(eyeData);
    if(allData == null){
      return null;
    }
    eyeData = allData.eyeData;

    if(eyeData == null){
      return null;
    }

    var cleanData = [];
    var totalMissing = 0;
    var totalCaptured = 0;
    for(var i=0, k=0; i<=40; i++){
      if(i == 20){
        i++;
      }
      var offset = i==0 || i==21 ? -100 : 0;
      
      var group = [];
      var start = actionData[i][0];
      var ended = actionData[i+1][0];
      var movement = i < 20 ? "horizontal" : "vertical";
      var missing = 0;
      
      for(; k<eyeData.length; k++){
        if(Time.diff(eyeData[k][0], start) <= offset){
          if(Time.diff(eyeData[k][0], ended) > 0){

            // push one data point before the beginning of the experiment, i.e. in calibrate section
            if(group.length== 0){
              // console.log(i + " " + movement + " " + offset + " " + start + " " + eyeData[k][0]);
              group.push({
                time: eyeData[k-1][0],
                x: eyeData[k-1][1],
                y: eyeData[k-1][2],
                type: "Calibrate",
                from: eyeData[k][4]
              });
            }
            
            // push the current element
            group.push({
              time: eyeData[k][0],
              x: eyeData[k][1],
              y: eyeData[k][2],
              type: eyeData[k][3],
              from: eyeData[k][4]
            });
            
            if(eyeData[k][4] == "missing"){
              missing++;
            }
          }
          else{
            break;
          }
        }
      }
      cleanData.push({start:start, end:ended, data:group, movement:movement, numMissingPoints:missing});
      totalMissing += missing;
      totalCaptured += (group.length - missing);
    }
    return {numMissingPoints:totalMissing, numCapturedPoints:totalCaptured, trial:cleanData};
    // return {numMissingPoints:allData.numMissingPoints, numCapturedPoints:allData.numCapturedPoints, trial:cleanData};
  },  


  /**
   Input "eye data file" and "action data file" and output "cleaned eye data".

   The "eye data file" is a CSV. 1st column is time, 2nd column is x position, 3rd column is y position.
   LocalTimeStamp,GazePointX (ADCSpx),GazePointY (ADCSpx), ...
   12:21:30:601, 805, 572, ...
   12:21:30:605, 857, 573, ...
   12:21:30:611, 901, 574, ...
   :
   */
  fillMissingData: function(eyeData){
    var fieldID = {timestamp:null, x:null, y:null, type:null};
    for(var k=0; k<eyeData[0].length; k++){
      if(eyeData[0][k] == "LocalTimeStamp"){
        fieldID.timestamp = k;
      }
      else if(eyeData[0][k] == "GazePointX (ADCSpx)"){
        fieldID.x = k;
      }
      else if(eyeData[0][k] == "GazePointY (ADCSpx)"){
        fieldID.y = k;
      }
      else if(eyeData[0][k] == "GazeEventType"){
        fieldID.type = k;        
      }
    }
    
    if(fieldID.timestamp==null || fieldID.x==null || fieldID.y==null || fieldID.type==null){
      return null;
    }

    var numCaptured = 0;
    var numMissing = 0;
    
    // fill the missing data
    var eyeDataClean = [];
    for(var i=1; i<eyeData.length; i++){
      if(eyeData[i][fieldID.x]!="" && eyeData[i][fieldID.y]!=""){
        numCaptured++;
        eyeDataClean.push([eyeData[i][fieldID.timestamp], parseInt(eyeData[i][fieldID.x]), parseInt(eyeData[i][fieldID.y]), eyeData[i][fieldID.type], "recorded"]);
      }
      else{
        if(eyeDataClean.length >= 1){
          var missingBegin = i-1;
          var missingEnd = null;
          for(; i<eyeData.length; i++){
            if(eyeData[i][fieldID.x]!="" && eyeData[i][fieldID.y]!="" && typeof(eyeData[i][fieldID.x])!="undefined" && typeof(eyeData[i][fieldID.y])!="undefined"){
              missingEnd = i;
              break;
            }
          }
          if(missingEnd != null){
            var missingCount = missingEnd - missingBegin - 1;
            numMissing += missingCount;

            var t1 = Time.parseInt(eyeData[missingBegin][fieldID.timestamp]);
            var x1 = parseInt(eyeData[missingBegin][fieldID.x]);
            var y1 = parseInt(eyeData[missingBegin][fieldID.y]);
            
            var t2 = Time.parseInt(eyeData[missingEnd][fieldID.timestamp]);
            var x2 = parseInt(eyeData[missingEnd][fieldID.x]);
            var y2 = parseInt(eyeData[missingEnd][fieldID.y]);
            
            var tDelta = (t2-t1)/(missingCount + 1);
            var xDelta = (x2-x1)/(missingCount + 1);
            var yDelta = (y2-y1)/(missingCount + 1);
            
            for(var j=1; j<=missingCount; j++){
              var missingData = eyeData[missingBegin + j];
              
              var t = Math.round(t1 + tDelta * j);
              var x = Math.round(x1 + xDelta * j);
              var y = Math.round(y1 + yDelta * j);
              
              var time = Time.parseStr(t);
              
              eyeDataClean.push([time, x, y, eyeData[missingBegin + j][fieldID.type], "missing"]);
              //console.log([time, x, y, eyeData[missingBegin + j][3]]);
            }
            eyeDataClean.push([eyeData[i][fieldID.timestamp], parseInt(eyeData[i][fieldID.x]), parseInt(eyeData[i][fieldID.y]), eyeData[i][fieldID.type], "missing"]);
          }
        }
      }
    }
    return {eyeData:eyeDataClean, numMissingPoints:numMissing, numCapturedPoints:numCaptured};
  },
  

  /**
   *
   */
  printEyeData: function(data, element){
    var str = "";
    for(var i=0; i<data.length; i++){
      str += data[i][0]+"\t"+data[i][1]+"\t"+data[i][2]+"\t"+data[i][3]+"\n";
    }
    if(typeof(element) != "undefined"){
      $("#tmp").val(str);
    }
    else{
      console.log(str);
    }
  }

}

