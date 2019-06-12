var visualizer = {
  visualFile: null,
  trials: null,
  pause: true,
  scheduleID: null,
  indexI: 0,
  indexJ: 0,
  dotSize: 4,
  lineWidth1: 4,
  lineWidth2: 4,
  lineWidth3: 4,
  

  images: null,
  
  init: function(){
    visualizer.imgInfo = $("#visualizer_imgInfo");
    visualizer.canvas = $("#visualizer_canvas")[0];
    visualizer.ctx = visualizer.canvas.getContext('2d');
    this.setupEventHandler();
  },
  
  setupEventHandler: function(){
    if(gui != null){
      gui.Window.get().on("close", function(){
        this.hide();
        this.close(true);
      });
    }
    
    $("#visualizer_file").change(function(event){
      visualizer.reset();
      visualizer.visualFile = event.target.files[0];
      if(typeof(visualizer.visualFile)!="undefined" && visualizer.visualFile!=null && visualizer.visualFile!="" && visualizer.visualFile!="undefined"){
        $(".visualizer_button").removeAttr("disabled");
      }
      else{
        $(".visualizer_button").attr("disabled", "disabled");
      }
    });
    
    $("#visualizer_submit").click(function(){
      if(visualizer.pause){
        visualizer.setRunningUI();
        visualizer.run();
      }
      else{
        visualizer.clearSchedule();
        visualizer.setPauseUI();
      }
    });

    $("#visualizer_resetTrial").click(function(){
      visualizer.indexJ = 0;
      if(visualizer.pause){
        visualizer.drawImage(visualizer.images[visualizer.indexI]);
      }
    });

    $("#visualizer_resetExp").click(function(){
      visualizer.resetDisplay();
    });


    $("#visualizer_displayType").change(function(){
      visualizer.displayType = parseInt($("#visualizer_displayType").val());
    });


    $("#visualizer_image").change(function(){
      visualizer.indexI = parseInt($("#visualizer_image").val()) - 1;
      visualizer.indexJ = 0;
    })
  },
  
  setRunningUI: function(){
    visualizer.pause = false;
    $("#visualizer_submit").val("Pause");
    $("#visualizer_imageSet").attr("disabled","disabled");
    $("#visualizer_image").attr("disabled","disabled");
    $("#visualizer_speed").attr("disabled","disabled");
    $("#visualizer_file").attr("disabled","disabled");
    $("#visualizer_fileContainer .__file-input-button").attr("disabled","disabled");
  },
  
  setPauseUI: function(){
    $("#visualizer_submit").val("Play");
    $("#visualizer_imageSet").removeAttr("disabled");

    $("#visualizer_image").removeAttr("disabled");
    $("#visualizer_speed").removeAttr("disabled");
    $("#visualizer_file").removeAttr("disabled");
    $("#visualizer_fileContainer .__file-input-button").removeAttr("disabled");
    visualizer.pause = true;
  },
  

  reset: function(){
    visualizer.clearSchedule();
    visualizer.resetDisplay();
    visualizer.images = null;
    visualizer.trials = null;
    visualizer.setPauseUI();
  },
  
  
  resetDisplay: function(){
    visualizer.indexI = 0,
    visualizer.indexJ = 0;
    $("#visualizer_image").val("1");
    visualizer.clearCanvas();
  },
  
  
  clearSchedule: function(){
    if(visualizer.scheduleID!=null){
      clearInterval(visualizer.scheduleID);
      visualizer.scheduleID = null;
    }
  },
  
  
  run: function(experimentType){
    visualizer.readImages();
  },
  

  readImages: function(){
    if(visualizer.images == null){
      visualizer.images = [];
      var experimentType = $("#visualizer_imageSet").val();
      for(var i=1; i<41; i++){
        var image = new Image();
        image.src = "data/image/exp0"+experimentType+"/img"+(i < 10 ? "0" : "")+i+".png", 

        visualizer.images.push(image);
      }
    }
    visualizer.readData();
  },
  

  readData: function(){
    if(visualizer.trials == null){
      var reader = new FileReader();
      reader.onload = function(e){
        try{
          visualizer.trials = JSON.parse(e.target.result);

          // check the file content is more or less valid
          var validFile = true;
          if(typeof(visualizer.trials)=="object" && typeof(visualizer.trials.length)=="number"){
            for(var i=0; i<visualizer.trials.length && validFile; i++){
              if(typeof(visualizer.trials[i].data) == "object"){
                var data = visualizer.trials[i].data;
                for(var j=0; j<data.length; j++){
                  if(typeof(data[j].type)=="undefined" || typeof(data[j].x)=="undefined" || typeof(data[j].y)=="undefined" || typeof(data[j].time)=="undefined"){
                    validFile = false;
                    break;
                  }
                }
              }
              else{
                validFile = false;
              }
            }
          }
          else{
            validFile = false;
          }

          if(!validFile){
            visualizer.fileReadingError();
          }
          else{
            visualizer.setSchedule();
          }
        }
        catch(e){
          visualizer.fileReadingError();
        }
      };
      reader.readAsText(visualizer.visualFile);
    }
    else{
      visualizer.setSchedule();
    }
  },
  
  fileReadingError: function(){
    app.showError("File reading error.");
    visualizer.reset();
  },
  
  setSchedule: function(){  
    visualizer.speed = parseInt($("#visualizer_speed").val());
    console.log(visualizer.speed);
    visualizer.displayType = parseInt($("#visualizer_displayType").val());
    visualizer.scheduleID = setInterval(function(){
      if(!visualizer.pause){
        visualizer.visualize();
      }
    }, visualizer.speed);
  },

  /**
   *
   */
  visualize: function(){
    if(visualizer.indexI < visualizer.trials.length){
      var data = visualizer.trials[visualizer.indexI].data; 
      if(visualizer.indexJ < data.length){
        if(visualizer.indexJ == 0 || visualizer.displayType == 2){ // display points now
          visualizer.drawImage(visualizer.images[visualizer.indexI]);
        }
        visualizer.drawNearest(visualizer.images[visualizer.indexI], data[visualizer.indexJ]);
        visualizer.imgInfo.text((visualizer.indexI+1)+" / "+data[visualizer.indexJ].time+" / "+data[visualizer.indexJ].type);
        visualizer.indexJ++;
      }
      else{
        visualizer.clearSchedule();
        visualizer.indexJ = 0;
        
        if((visualizer.indexI+1) < visualizer.trials.length){
          visualizer.indexI++;
          setTimeout(function(){
            $("#visualizer_image").val(visualizer.indexI+1);
            visualizer.setSchedule();
          }, data.length == 0 ? 10 : 3000);
        }
        else{
          visualizer.setPauseUI();
        }
      }
    }
    else{
      visualizer.clearSchedule();
      visualizer.setPauseUI();
    }
  },
  
  clearCanvas: function(){
    visualizer.ctx.clearRect(0, 0, visualizer.canvas.width, visualizer.canvas.height);
  },
    
  drawImage: function(img){
    var ctx = visualizer.ctx;
    visualizer.canvas.width = img.width;
    visualizer.canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
  },
  
  
  drawNearest:function(img, data){
    var ctx = visualizer.ctx;
    var offset = 0;
    
    if(data.type=="Calibrate"){
      ctx.strokeStyle='yellow';
      ctx.fillStyle='yellow';
      offset = 0;
    }
    else if(data.type=="Fixation"){
      ctx.strokeStyle='red';
      ctx.fillStyle='red';
      offset = 0;
    }
    else if(data.type=="Saccade"){
      ctx.strokeStyle='blue';
      ctx.fillStyle='blue';
      offset = 8;
    }
    else if(data.type=="SmoothPursuit"){
      ctx.strokeStyle='green';
      ctx.fillStyle='green';
      offset = 4;
    }
    else{
      ctx.strokeStyle='black';
      ctx.fillStyle='black';
      offset = 12;
    }

    ctx.beginPath();
    ctx.arc(data.x, data.y, visualizer.dotSize, 0, 2*Math.PI, true);
    ctx.fill();
    ctx.stroke();

    // draw the nearest
    if(data.type != "Calibrate"){
      var width = 43+offset*2;
      var height = 36+offset*2;
      var x1 = data.letters[0].x;
      var y1 = data.letters[0].y;
      var d1 = Geometry.distance(data.x, data.y, x1+21.5, y1+18);
      ctx.beginPath();
      ctx.lineWidth = visualizer.lineWidth1;
      ctx.rect(x1-offset, y1-offset, width, height);
      ctx.stroke();
      
      var x2 = data.letters[1].x;
      var y2 = data.letters[1].y;
      var d2 = Geometry.distance(data.x, data.y, x2+21.5, y2+18);
      if(d2 < d1*1.3){
        ctx.beginPath();
        ctx.lineWidth = visualizer.lineWidth2;
        ctx.rect(x2-offset, y2-offset, width, height);
        ctx.stroke();
      }
  
      var x3 = data.letters[2].x;
      var y3 = data.letters[2].y;
      var d3 = Geometry.distance(data.x, data.y, x3+21.5, y3+18);
      if(d3 < d1*1.3){
        ctx.beginPath();
        ctx.lineWidth = visualizer.lineWidth2;
        ctx.rect(x3-offset, y3-offset, width, height);
        ctx.stroke();
      }
    }
    ctx.closePath();
  }
}

$(function(){
  visualizer.init();
});
