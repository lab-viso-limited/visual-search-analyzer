var AppUtil = {
  
  /**
   Screen size: 1920x1080 
   */
  visualAngle: function(x1, y1, x2, y2){
    var p = Math.sqrt(Math.twice(x1-960) + Math.twice(y1-540));
    var q = Math.sqrt(Math.twice(x2-960) + Math.twice(y2-540));
    var r = 2262.485967; // eye to screen distance = 60x37.7 = 2262.485967
    
    var a = Math.sqrt(Math.twice(x2-x1) + Math.twice(y2-y1));
    var b = Math.sqrt(Math.twice(q) + Math.twice(r));
    var c = Math.sqrt(Math.twice(p) + Math.twice(r));

    return Geometry.getAngleByThreeSides(a, b, c);
  }

}

