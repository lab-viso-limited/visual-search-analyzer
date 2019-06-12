var imageAnalyzer = {

  /**
   * Get the nearest letter and the distance based on x and y.
   * @return a JSON object: {"nearest":"A", "distance":15.2}
   */
  getNearestLetter: function(workingData){
    for(var i=0; i<workingData.trial.length; i++){
      if(workingData.trial[i].status == "normal" && workingData.trial[i].data.length >0){
        var letters = workingData.trial[i].letter;
        var data = workingData.trial[i].data;
        for(var j=0; j<data.length; j++){
          var x = data[j].x;
          var y = data[j].y;
          var nearestLetters = [];

          /*
          */
          var distanceArray = [];
          for(var k=0; k<letters.length; k++){
            var cenx=letters[k].x+letters[k].width/2;
            var ceny=letters[k].y+letters[k].height/2;
            var dis=Math.sqrt(Math.twice(x-cenx)+Math.twice(y-ceny));
            var distance = {};
            distance.index=k;
            distance.dis=dis;
            distanceArray.push(distance);
          }

          var index = [];
          for(var l=0; l<3; l++){
            var mindis;
            var minIndex;
            var deleteIndex;
            var nearLetter={};
            for(var m=0;m<distanceArray.length;m++ ){
              if(m==0){
                mindis=distanceArray[m].dis;
                minIndex=distanceArray[m].index;
              }
              else{
                if(mindis>distanceArray[m].dis){
                  mindis=distanceArray[m].dis;
                  minIndex=distanceArray[m].index;
                  deleteIndex=m;
                }
              }
            }
            nearLetter.mindis=mindis;
            nearLetter.minIndex=minIndex;
            index.push(nearLetter);
            distanceArray.splice(deleteIndex,1);
          }
          
          for(var n=0;n<index.length;n++){
            var position = index[n].minIndex;
            nearestLetters.push({
              letter: letters[position].letter,
              x: letters[position].x,
              y: letters[position].y,
              distance: index[n].mindis
            });
          }
          
          data[j].letters = nearestLetters;
        }
      }
    }
  },

}




