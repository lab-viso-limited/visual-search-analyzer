var visualSearchAnalyzer = {
  eyeData: null,
  actionData: null,
  letterData: null,
  workingData: null,
  
  algorithm: null,

  /**
   *
   */
  init: function(){
    this.setupEventHandler();
  },
  
  /**
   *
   */
  setupEventHandler: function(){
    $("input[name=visualSearch_datasrc]").on("change", function(event){
      if($(this).val() == "filePath"){
        $("tr[name=visualSearch_filePathInput]").show();
        $("tr[name=visualSearch_filesInput_eyeData]").hide();
        $("tr[name=visualSearch_filesInput_actionData]").hide();
        
        if($("#visualSearch_filePath").val() != null){
          $("#visualSearch_run").removeAttr("disabled");
        }
        else{
          $("#visualSearch_run").attr("disabled", "");
        }
      }
      else{
        $("tr[name=visualSearch_filePathInput]").hide();
        $("tr[name=visualSearch_filesInput_eyeData]").show();
        $("tr[name=visualSearch_filesInput_actionData]").show();
        if($("#visualSearch_actionDataFile")!=null && $("#visualSearch_eyeDataFile")!=null){
          $("#visualSearch_run").removeAttr("disabled");
        }
        else{
          $("#visualSearch_run").attr("disabled", "");
        }
      }
    });

    $("#visualSearch_filePath").on("change", function(event){
      if($("#visualSearch_filePath").val() != null){
        $("#visualSearch_run").removeAttr("disabled");
      }
      else{
        $("#visualSearch_run").attr("disabled", "");
      }
    });
    
    $("#visualSearch_actionDataFile").change(function(event){
      if($("#visualSearch_actionDataFile")!=null && $("#visualSearch_eyeDataFile")!=null){
        $("#visualSearch_run").removeAttr("disabled");
      }
      else{
        $("#visualSearch_run").attr("disabled", "");
      }
    });
    
    $("#visualSearch_eyeDataFile").change(function(event){
      if($("#visualSearch_actionDataFile")!=null && $("#visualSearch_eyeDataFile")!=null){
        $("#visualSearch_run").removeAttr("disabled");
      }
      else{
        $("#visualSearch_run").attr("disabled", "");
      }
    });
    
    $("#visualSearch_run").click(function(){
      visualSearchAnalyzer.run();
    });
    
    $("#visualSearch_downloadSummary").on("change", function(event){
      visualSearchAnalyzer.downloadSummary($(this).val());
      $(this).val("");
    });    
    $("#visualSearch_downloadSummaryUseFixiationMedian").on("change", function(event){
      visualSearchAnalyzer.downloadSummary($(this).val(), "use fixation median");
      $(this).val("");
    });    
    $("#visualSearch_downloadFixationData").on("change", function(event){
      visualSearchAnalyzer.downloadFixationData($(this).val());
      $(this).val("");
    });    
    $("#visualSearch_downloadSaccadeData").on("change", function(event){
      visualSearchAnalyzer.downloadSaccadeData($(this).val());
      $(this).val("");
    });    
    $("#visualSearch_downloadVisualData").on("change", function(event){
      visualSearchAnalyzer.downloadVisualData($(this).val());
      $(this).val("");
    });    
    $("#visualSearch_downloadPointData").on("change", function(event){
      visualSearchAnalyzer.downloadPointData($(this).val());
      $(this).val("");
    });    
  },
  
  
  /**
   */
  run: function(){
    $("#loadingMessage").html("- LOADING -");
    $("#loadingLayer").show();
    
    visualSearchAnalyzer.workingData = [];
    visualSearchAnalyzer.algorithm = $('input[name=visualSearch_algorithm]:checked').val();

    // analyze workflow
    var userIDs = [];
    var users = [];
    var analyze = function(num){
      var userID = userIDs[num];
      visualSearchAnalyzer.readEyeData(users[userID].eyeFile, {
        complete: function(eyeData){
          visualSearchAnalyzer.readActionData(users[userID].actionFile, {
            complete: function(actionData){
              $("#loadingMessage").html("- ANALYSIS ("+userID+") -");
              visualSearchAnalyzer.conductAnalysis(eyeData, actionData, {
                complete: function(workingData){
                  visualSearchAnalyzer.workingData.push({userID:userID, workingData:workingData})
                  if((num+1) < userIDs.length){
                    analyze(num + 1);
                  }
                  else{
                    $("#loadingLayer").hide();
                  }
                }
              });
            } // end complete
          }); // end readActionData
        } // end complete
      }); // end readEyeData
    } // end analyze
    
    if($("input[name=visualSearch_datasrc]:checked").val() == "filePath"){
      var files = fs.readdirSync($("#visualSearch_filePath").val());
      for(var i=0; i<files.length; i++){
        if(files[i].indexOf("_eye") > 0){
          var userID = files[i].substring(0, files[i].indexOf("_eye"));
          if(!(userID in users)){
            users[userID] = {};
            userIDs.push(userID);
          }
          if(typeof(users[userID].eyeFile) != "undefined"){
            app.showError("Error reading data from "+userID);
          }
          users[userID].eyeFile = $("#visualSearch_filePath").val()+"/"+files[i];
        }
        else if(files[i].indexOf("_action") > 0){
          var userID = files[i].substring(0, files[i].indexOf("_action"));
          if(!(userID in users)){
            users[userID] = {};
            userIDs.push(userID);
          }
          if(typeof(users[userID].actionFile) != "undefined"){
            app.showError("Error reading data from "+userID);
          }
          users[userID].actionFile = $("#visualSearch_filePath").val()+"/"+files[i];
        }
      }
      
      // validate files
      var t1 = (new Date()).getTime();
      Object.keys(users).forEach(function(key, index){
        var n = Object.keys(this[key]).length;
        if(n != 2){
          app.showError("Error reading data. "+key+" contains "+n+" files.");
        }
      }, users);
      console.log("File Checking Done (Time: "+((new Date()).getTime()-t1)+")");
    }
    
    else{
      userIDs.push(0);
      users[0] = {};
      users[0].eyeFile = $("#visualSearch_eyeDataFile").val();
      users[0].actionFile = $("#visualSearch_actionDataFile").val();      
    }

    // perform the analysis now
    visualSearchAnalyzer.readLetterData($("#visualSearch_imageSet").val(), {
      complete: function(){
        analyze(0);
      }
    });
  },
  
  /**
   */
  readLetterData: function(imageSet, callback){
    visualSearchAnalyzer.letterData = [];
    for(var i=1; i<=40; i++){
      $.ajax({
        url: "data/image/exp0"+imageSet+"/img"+(i < 10 ? "0" : "")+i+".txt", 
        dataType: "json",
        num: i,
        success: function(result){
          visualSearchAnalyzer.letterData.push(result);
          if(this.num == 40){
            callback.complete();
          }
        },
        error: function(e){
          app.showError("An unknown error occurs (code: -12).");
        }
      });
    }
  },

  /**
   */
  readEyeData: function(file, callback){
    fs.readFile(file, "utf8", function(error, fileContent){
      if(error){
        app.showError("Error reading eye data (error code: -12).");
      }
      else{
        Papa.parse(fileContent, {
          delimiter: "", // auto determine
        	complete: function(results, file){
            var eyeData = results.data;
  
            if(typeof(eyeData)!="object" || typeof(eyeData.length)!="number" || typeof(eyeData[0])!="object" ||  typeof(eyeData[0].length)!="number"){
              app.showError("Error reading eye data (error code: -10).");
            }
            else{
              callback.complete(eyeData);
            }
          },
          errors: function(error, file){
            app.showError("Error reading eye data (error code: -11).");
          }
        });
      }
    });
  },

  /**
   */
  readActionData: function(file, callback){
    fs.readFile(file, "utf8", function(error, fileContent){
      if(error){
        app.showError("Error reading action data (error code: -12).");
      }
      else{
        Papa.parse(fileContent, {
          delimiter: "", // auto determine
        	complete: function(results, file){
            var actionData = results.data;
  
            if(typeof(actionData)!="object" || typeof(actionData.length)!="number"){
              app.showError("Error reading action data (error code: -10).");
            }
            else{
              callback.complete(actionData);
            }
          },
          errors: function(error, file){
            app.showError("Error reading action data (error code: -11).");
          }
        });
      }
    });
  },

  /**
   */
  conductAnalysis: function(eyeData, actionData, callback){
    // console.log(visualSearchAnalyzer.letterData);
    // console.log(eyeData);
    // console.log(actionData);

    var workingData = null;

    var t1 = (new Date()).getTime();
    workingData = dataCleaner.cleanVisualSearchData(eyeData, actionData);
    if(workingData == null){
      visualSearchAnalyzer.showError("Error in analyzing. Make sure your files are correct (code: -41).");
      return;
    }
    for(var i=0; i<workingData.trial.length; i++){
      workingData.trial[i].letter = visualSearchAnalyzer.letterData[i];
    }
    console.log("Data Cleaning Done (Time: "+((new Date()).getTime()-t1)+")");

    
    var t1 = (new Date()).getTime();
    if(visualSearchAnalyzer.algorithm == "ivdt"){
      velocityThreshold = parseFloat($("#visualSearch_ivdt_velocity").val())/1000;
      var isCompleted = visualSearchIVDT.run(workingData.trial, velocityThreshold, $("#visualSearch_ivdt_dispersion").val(), $("#visualSearch_ivdt_windowSize").val(), 2);
      if(!isCompleted){
        app.showError("Error in processing the data (code: -42).");
        return;
      }
    }
    else if(visualSearchAnalyzer.algorithm == "stDBscan"){
      var minPoint = $("#visualSearch_stDBScan_minTime").val();
      visualSearchSTDBscan.run(workingData.trial, minPoint, $("#visualSearch_stDBScan_minClusterSize").val());
    }
    console.log("Algorithm Running Done (Time: "+((new Date()).getTime()-t1)+")");


    var t1 = (new Date()).getTime();
    visualSearchAnalyzer.analyzeData(workingData);
    imageAnalyzer.getNearestLetter(workingData);
    console.log("Analyzing Done (Time: "+((new Date()).getTime()-t1)+")");
    
    callback.complete(workingData);
    
    // console.log(workingData);
  },


  /**
   */
  analyzeData: function(workingData){
    var trial = workingData.trial;
    for(var i=0; i<trial.length; i++){ // for each graph (40 graphs)
      trial[i].groupedData = [];
      if(trial[i].status == "normal"){
        for(var j=0, sameTypeData=[]; j<trial[i].data.length; j++){
          sameTypeData.push({
            time: trial[i].data[j].time,
            x: trial[i].data[j].x,
            y: trial[i].data[j].y,
          });
          
          if(j+1>=trial[i].data.length || trial[i].data[j].type!=trial[i].data[j+1].type){
            var previousData = j-sameTypeData.length>=0 ? trial[i].data[j-sameTypeData.length] : sameTypeData[0];
            var nextData = j+1>=trial[i].data.length ?sameTypeData[sameTypeData.length - 1] : trial[i].data[j+1];
  
            var currentStartTime = Time.parseInt(sameTypeData[0].time);
            var currentEndTime = Time.parseInt(sameTypeData[sameTypeData.length - 1].time);
            
            var expectedStartTime = trial[i].data[j].type=="Saccade" ? Time.parseInt(previousData.time) : currentStartTime;
            var expectedEndTime = trial[i].data[j].type=="Saccade" ? Time.parseInt(nextData.time) : currentEndTime;
  
             // mid-point
            // var expectedStartTime = currentStartTime - (currentStartTime - Time.parseInt(previousData.time))/2;
            // var expectedEndTime = currentEndTime + (Time.parseInt(nextData.time) - currentEndTime)/2;
            
            var pushData = {
              type: trial[i].data[j].type,
              data: sameTypeData,
              duration: (expectedEndTime - expectedStartTime),
            };
            
            if(trial[i].data[j].type=="Saccade"){
              var tmpData = sameTypeData.slice();
              tmpData.unshift(previousData);
              tmpData.push(previousData);
              pushData.amplitude = this.totalSaccadeAmplitude(tmpData);
            }
            
            trial[i].groupedData.push(pushData);
            sameTypeData = [];
          }
        }
      }
      else{
      }
    }
    
    this.analyzeFixation(workingData);
    this.analyzeResponseTime(workingData);
    this.analyzeSaccade(workingData);
    this.analyzeUnclassified(workingData);
    this.analyzeSaccadicLatency(workingData);
  },
  
  
  /**
   */
  analyzeFixation: function(workingData){
    var totalTrial = 0;
    var totalNum = 0;
    var totalTime = 0;
    for(var i=0; i<workingData.trial.length; i++){
      if(workingData.trial[i].status == "normal"){
        totalTrial++;
        for(var j=0; j<workingData.trial[i].groupedData.length; j++){
          if(workingData.trial[i].groupedData[j].type == "Fixation"){
            totalTime += workingData.trial[i].groupedData[j].duration;
            totalNum++;
          }
        }
      }
    }
    workingData.meanFixationCount = totalNum/totalTrial;
    workingData.meanFixationDuration = totalTime/totalNum;
    workingData.meanFixationDurationPerTrial = totalTime/totalTrial;
  },

  
  /**
   */
  analyzeUnclassified: function(workingData){
    var totalTrial = 0;
    var totalNum = 0;
    var totalTime = 0;
    var totalPoints = 0;
    for(var i=0; i<workingData.trial.length; i++){
      if(workingData.trial[i].status == "normal"){
        totalTrial++;
        for(var j=0; j<workingData.trial[i].groupedData.length; j++){
          if(workingData.trial[i].groupedData[j].type == "Unclassified"){
            totalTime += workingData.trial[i].groupedData[j].duration;
            totalPoints += workingData.trial[i].groupedData[j].data.length;
            totalNum++;
          }
        }
      }
    }
    workingData.numUnclassifiedPoints = totalPoints;
    workingData.meanUnclassifiedCount = totalNum/totalTrial;
    workingData.meanUnclassifiedDuration = totalNum == 0 ? 0 : totalTime/totalNum;
    workingData.meanUnclassifiedDurationPerTrial = totalTime/totalTrial;    
  },
  
  /**
   In pixel per millsecond based on visual angle
   */
  analyzeSaccade: function(workingData){
    var totalTrial = 0;
    var totalNum = 0;
    var totalTime = totalVelocity = totalAmplitude = 0;
    var totalTimeUseMedian = totalVelocityUseMedian = totalAmplitudeUseMedian = 0;
    
    for(var i=0; i<workingData.trial.length; i++){
      if(workingData.trial[i].status == "normal"){
        totalTrial++;
        var maxGroup = workingData.trial[i].groupedData.length;
        for(var j=0; j<maxGroup; j++){
          if(workingData.trial[i].groupedData[j].type == "Saccade"){
            var duration = workingData.trial[i].groupedData[j].duration;
            var amplitude = workingData.trial[i].groupedData[j].amplitude;
            var velocity = amplitude/duration;

            totalTime += duration;
            totalAmplitude += amplitude;
            totalVelocity += velocity;
            totalNum++;

            // median fixation begin
            var durationUseMedian = workingData.trial[i].groupedData[j].duration;
            var amplitudeUseMedian = workingData.trial[i].groupedData[j].amplitude;
            
            // before
            if(j>=1 && workingData.trial[i].groupedData[j-1].type == "Fixation"){
              var saccadeData = workingData.trial[i].groupedData[j].data;
              var fixationData = workingData.trial[i].groupedData[j-1].data;

              var totalFixationPoint = fixationData.length;
              var medianFixationPoint = Math.floor(totalFixationPoint/2);

              var timeHalf = Time.diff(fixationData[medianFixationPoint].time, saccadeData[0].time);
              totalTimeUseMedian += timeHalf;
              
              for(var m=medianFixationPoint; m<totalFixationPoint-1; m++){
                amplitudeUseMedian += AppUtil.visualAngle(fixationData[m].x, fixationData[m].y, fixationData[m+1].x, fixationData[m+1].y);
              }
              amplitudeUseMedian += AppUtil.visualAngle(fixationData[totalFixationPoint-1].x, fixationData[totalFixationPoint-1].y, saccadeData[0].x, saccadeData[0].y);
            }
            
            // after
            if(j+1<maxGroup && workingData.trial[i].groupedData[j+1].type == "Fixation"){
              var saccadeData = workingData.trial[i].groupedData[j].data;
              var fixationData = workingData.trial[i].groupedData[j+1].data;

              var totalFixationPoint = fixationData.length;
              var medianFixationPoint = Math.floor(totalFixationPoint/2);
              
              var timeHalf = Time.diff(saccadeData[saccadeData.length-1].time, fixationData[medianFixationPoint].time);
              totalTimeUseMedian += timeHalf;
              
              for(var m=0; m<medianFixationPoint-1; m++){
                amplitudeUseMedian += AppUtil.visualAngle(fixationData[m].x, fixationData[m].y, fixationData[m+1].x, fixationData[m+1].y);
              }
              amplitudeUseMedian += AppUtil.visualAngle(saccadeData[saccadeData.length-1].x, saccadeData[saccadeData.length-1].y, fixationData[0].x, fixationData[0].y);
            }
            
            var velocityUseMedian = amplitudeUseMedian/durationUseMedian;

            totalTimeUseMedian += durationUseMedian;
            totalAmplitudeUseMedian += amplitudeUseMedian;
            totalVelocityUseMedian += velocityUseMedian;
            // median fixation end
          }
        }
      }
    }
    workingData.meanSaccadeCount = totalNum/totalTrial;
    workingData.meanSaccadeDuration = totalTime/totalNum;
    workingData.meanSaccadeDurationPerTrial = totalTime/totalTrial;
    workingData.meanSaccadeVelocity = totalVelocity/totalNum;
    workingData.meanSaccadeAmplitude = totalAmplitude/totalNum;
    
    // use fixation as median
    workingData.meanSaccadeDurationUseMedian = totalTimeUseMedian/totalNum;
    workingData.meanSaccadeDurationPerTrialUseMedian = totalTimeUseMedian/totalTrial;
    workingData.meanSaccadeVelocityUseMedian = totalVelocityUseMedian/totalNum;
    workingData.meanSaccadeAmplitudeUseMedian = totalAmplitudeUseMedian/totalNum;
  },
  
  /**
   In pixel per millsecond based on visual angle
   */
  analyzeSaccadicLatency: function(workingData){
    var totalTrial = expectedTotalTrial = 0;
    var totalDuration = 0;
    for(var i=0; i<workingData.trial.length; i++){
      if(workingData.trial[i].status == "normal"){
        expectedTotalTrial++;
        var maxGroup = workingData.trial[i].groupedData.length;
        for(var j=0; j<maxGroup; j++){
          if(workingData.trial[i].groupedData[j].type == "Saccade"){
            var duration = Time.diff(workingData.trial[i].start, workingData.trial[i].groupedData[j].data[0].time);
            if(typeof(duration)=="number" || typeof(duration)=="Number"){
              totalDuration += duration;
              totalTrial++;
            }
            break;
          }
        }
      }
    }
    if(expectedTotalTrial != totalTrial){
      console.log("Warning in sacadic latency: expected trials ("+ expectedTotalTrial + ") not equals to total trials (" + totalTrial + ")");
    }
    workingData.meanSaccadicLatency = totalDuration/totalTrial;
  },
  
  
  /**
   In milliseconds
   */
  analyzeResponseTime: function(workingData){
    var totalTime = 0, numTrial = 0;
    for(var i=0; i<workingData.trial.length; i++){
      if(workingData.trial[i].status == "normal"){
        totalTime += Time.diff(workingData.trial[i].start, workingData.trial[i].end);
        numTrial++;
      }
    }
    workingData.meanResponseTime = totalTime/numTrial;
  },
  
  
  /**
   * based on visual angle
   */
  totalSaccadeAmplitude: function(data){
    var amplitude = 0;
    for(var i=0; i<data.length-1; i++){
      amplitude += AppUtil.visualAngle(data[i].x, data[i].y, data[i+1].x, data[i+1].y);
    }
    return amplitude;
  },


  /**
   */
  downloadSummary: function(filename, type){
    var stream = fs.createWriteStream(filename);
    stream.once('open', function(fd) {
      if(visualSearchAnalyzer.workingData != null){
        if(visualSearchAnalyzer.workingData.length >= 2){
          stream.write("UserID,");
        }
        stream.write("Points,");
        stream.write("Captured Points,");
        stream.write("Missing Points,");
        stream.write("Missing Percent,");
        stream.write("Unclassified Points,");
        stream.write("Mean Response time (ms),");
        stream.write("Mean Number of Fixations,");
        stream.write("Mean Duration of a Fixation (ms),");
        stream.write("Mean Duration of All Fixations in a Trial (ms),");
        stream.write("Mean Number of Saccades,");
        stream.write("Mean Duration of a Saccade (ms),");
        stream.write("Mean Duration of All Saccade in a Trial (ms),");
        stream.write("Mean Saccade Velocity (degree/ms),");
        stream.write("Mean Saccade Amplitude (degree),");
        stream.write("Mean Duration of a Saccadic Latency (ms),");
        stream.write("Mean Number of Unclassified,");
        stream.write("Mean Duration of a Unclassified (ms),");
        stream.write("Mean Duration of All Unclassified in a Trial (ms)\n");
        
        // console.log(visualSearchAnalyzer.workingData);
        
        for(var i=0; i<visualSearchAnalyzer.workingData.length; i++){
          if(visualSearchAnalyzer.workingData.length >= 2){
            stream.write(visualSearchAnalyzer.workingData[i].userID+",");
          }
          var workingData = visualSearchAnalyzer.workingData[i].workingData;
          var totalPoints = workingData.numCapturedPoints + workingData.numMissingPoints;
          if(typeof(summaryType) == "undefined"){
            stream.write(totalPoints+","+workingData.numCapturedPoints+","+workingData.numMissingPoints+","+(workingData.numMissingPoints/totalPoints)+","+workingData.numUnclassifiedPoints+","+workingData.meanResponseTime+","+workingData.meanFixationCount+","+workingData.meanFixationDuration+","+workingData.meanFixationDurationPerTrial+","+workingData.meanSaccadeCount+","+workingData.meanSaccadeDuration+","+workingData.meanSaccadeDurationPerTrial+","+workingData.meanSaccadeVelocity+","+workingData.meanSaccadeAmplitude+","+workingData.meanSaccadicLatency+","+workingData.meanUnclassifiedCount+","+workingData.meanUnclassifiedDuration+","+workingData.meanUnclassifiedDurationPerTrial);
          }
          else{
            stream.write(totalPoints+","+workingData.numCapturedPoints+","+workingData.numMissingPoints+","+(workingData.numMissingPoints/totalPoints)+","+workingData.numUnclassifiedPoints+","+workingData.meanResponseTime+","+workingData.meanFixationCount+","+workingData.meanFixationDuration+","+workingData.meanFixationDurationPerTrial+","+workingData.meanSaccadeCount+","+workingData.meanSaccadeDurationUseMedian+","+workingData.meanSaccadeDurationPerTrialUseMedian+","+workingData.meanSaccadeVelocityUseMedian+","+workingData.meanSaccadeAmplitudeUseMedian+","+workingData.meanSaccadicLatency+","+workingData.meanUnclassifiedCount+","+workingData.meanUnclassifiedDuration+","+workingData.meanUnclassifiedDurationPerTrial);
          }
          stream.write("\n");
        }
      }
      stream.end();
    });
  },
  
  /**
   */
  downloadFixationData: function(filename){
    var stream = fs.createWriteStream(filename);
    stream.once('open', function(fd) {
      if(visualSearchAnalyzer.workingData != null){
        if(visualSearchAnalyzer.workingData.length >= 2){
          stream.write("UserID,");
        }
        stream.write("Trial,Cluster,Duration\n");
        for(var k=0; k<visualSearchAnalyzer.workingData.length; k++){
          var workingData = visualSearchAnalyzer.workingData[k].workingData;
          for(var i=0; i<workingData.trial.length; i++){
            var groupedData = workingData.trial[i].groupedData;
            for(var j=0; j<groupedData.length; j++){
              if(groupedData[j].type == "Fixation"){
                if(visualSearchAnalyzer.workingData.length >= 2){
                  stream.write(visualSearchAnalyzer.workingData[k].userID+",");
                }
                stream.write((i+1) + "," + (j+1) + "," + groupedData[j].duration + "\n");
              }
            }
          }
        }
      }
      stream.end();
    });
  },
  
  /**
   */
  downloadSaccadeData: function(filename){
    var stream = fs.createWriteStream(filename);
    stream.once('open', function(fd) {
      if(visualSearchAnalyzer.workingData != null){
        if(visualSearchAnalyzer.workingData.length >= 2){
          stream.write("UserID,");
        }
        stream.write("Trial,Cluster,Duration,Amplitude\n");
        for(var k=0; k<visualSearchAnalyzer.workingData.length; k++){
          var workingData = visualSearchAnalyzer.workingData[k].workingData;
          for(var i=0; i<workingData.trial.length; i++){
            var groupedData = workingData.trial[i].groupedData;
            for(var j=0; j<groupedData.length; j++){
              if(groupedData[j].type == "Saccade"){
                if(visualSearchAnalyzer.workingData.length >= 2){
                  stream.write(visualSearchAnalyzer.workingData[k].userID+",");
                }
                stream.write((i+1) + "," + (j+1) + "," + groupedData[j].duration + "," + groupedData[j].amplitude + "\n");
              }
            }
          }
        }
      }
      stream.end();
    });
  },
  


  /**
   */
  downloadPointData: function(filename){
    var stream = fs.createWriteStream(filename);
    stream.once('open', function(fd) {
      if(visualSearchAnalyzer.workingData != null){
        if(visualSearchAnalyzer.workingData.length >= 2){
          stream.write("UserID,");
        }
        stream.write("Trial,Point,Time,X,Y,Type,Recorded or Missing\n");
        for(var k=0; k<visualSearchAnalyzer.workingData.length; k++){
          var workingData = visualSearchAnalyzer.workingData[k].workingData;
          for(var i=0; i<workingData.trial.length; i++){
            var data = workingData.trial[i].data;
            for(var j=0; j<data.length; j++){
              if(visualSearchAnalyzer.workingData.length >= 2){
                stream.write(visualSearchAnalyzer.workingData[k].userID+",");
              }
              stream.write((i+1)+","+(j+1)+","+data[j].time+","+data[j].x+","+data[j].y+","+data[j].type+","+data[j].from+"\n");
            }
          }
        }
      }
      stream.end();
    });
  },
  
  
  /**
   */
  downloadVisualData: function(filename){
    var stream = fs.createWriteStream(filename);
    
    console.log(visualSearchAnalyzer.workingData.length);
    
    stream.once('open', function(fd) {
      if(visualSearchAnalyzer.workingData != null && visualSearchAnalyzer.workingData.length == 1){
        var visualTrials = [];
        var workingData = visualSearchAnalyzer.workingData[0].workingData;
        for(var i=0; i<workingData.trial.length; i++){
          visualTrials.push({data: workingData.trial[i].data.slice()});
        }
        stream.write(JSON.stringify(visualTrials));
      }
      else{
      }
      stream.end();
      // stream.end("Not available for mutliple data files analysis");
    });
  }

}


$(function(){
  visualSearchAnalyzer.init();
});


