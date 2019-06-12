Array.prototype.max = function() {
  return Math.max.apply(null, this);
};

Array.prototype.min = function() {
  return Math.min.apply(null, this);
};

Math.twice = function(num){
  return num*num;
};

Math.decimal = function(num, decimalPoint){
  return parseFloat(Math.round(num * 100) / 100).toFixed(typeof(decimalPoint) == "undefined" ? 3: decimalPoint);
};

