var gui = require('nw.gui');
var fs = require('fs');

if(gui != null){
  gui.Window.get().on("close", function(){
    this.hide();
    this.close(true);
  });
}
  
var app = {
  showError: function(msg){
    $('#alertbox .modal-body').html(msg);
    $('#alertbox').modal('show');
    $("#loadingLayer").hide();
  }
}
