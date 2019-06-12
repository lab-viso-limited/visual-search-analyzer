var visualSearchSTDBscan = {

  run: function(trials, minPoints, minClusterSize, maxClusterSize){
    for(var i=0; i<trials.length; i++){
      var data = trials[i].data;
      var pointsToAnalyze = data.length - minPoints;
      var type = [];
      
      // forward pass
      for(var j=1; j<pointsToAnalyze; j++){ // first point is Calibrate
        var currentPoint = j;
        var numInCluster = 0;
        for(var k=j+1; k<data.length; k++){
          var distance = Geometry.distance(data[currentPoint].x, data[currentPoint].y, data[k].x, data[k].y);
          if(distance < minClusterSize){
            if(++numInCluster >= minPoints){
              break;
            }
          }
          else{
            break;
          }
        }
        
        if(numInCluster >= minPoints){
          trials[i].data[currentPoint].type = "Fixation";
        }
        else{
          trials[i].data[currentPoint].type = "Saccade";
        }
      } // end for j
      
      // backward pass
      for(var j=data.length-1; j>=minPoints; j--){
        var currentPoint = j;
        var numInCluster = 0;
        for(var k=j-1; k>=0; k--){
          var distance = Geometry.distance(data[currentPoint].x, data[currentPoint].y, data[k].x, data[k].y);
          if(distance < minClusterSize){
            if(++numInCluster >= minPoints){
              break;
            }
          }
          else{
            break;
          }
        }
        
        if(numInCluster >= minPoints){
          if(trials[i].data[currentPoint].type != "Saccade"){
            trials[i].data[currentPoint].type = "Fixation";
          }
        }
        else{
          trials[i].data[currentPoint].type = "Saccade";
        }
      } // end for j
    } // end for i
    
    // final checking minimum fixation is equals to the minPoints
    for(var i=0; i<trials.length; i++){
      var data = trials[i].data;
      for(var j=0; j<data.length; j++){
        if(data[j].type == "Fixation"){
          var num = 0;
          var k = j+1;
          for(; k<data.length; k++){
            if(data[k].type == "Fixation"){
              num++;
            }
            else{
              break;
            }
          }
          
          if(num < minPoints){
            for(var m=j; m<k; m++){
              trials[i].data[m].type = "Saccade";
            }
          }
          j += num;
        }
      } // end j
    } // end i
    
  } // end run

}