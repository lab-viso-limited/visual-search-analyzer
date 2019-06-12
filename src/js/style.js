$(function(){
  
  $("input.input-file").each(function(){
    $(this).css({position:"absolute", opacity:0, height:"inherit", cursor:"pointer"});
    $(this).wrap('<div style="position:relative; height:100%"></div>');
    $(this).before('<div style="position:absolute; top:-4px"><table style="border-collapse:collapse; border:none; padding:0; margin:0"><tr style="padding:0"><td style="border:none; margin:0; padding:0; vertical-align:middle"><input type="button" value="Choose" class="btn btn-primary __file-input-button"></td><td style="border:none; margin:0; padding:0 0 0 5px; vertical-align:middle"><div class="__file-input-filename"></div></td></tr></table></div>');
    
    $(this).on("change", function(){
      var file = $(this).val();
      var filename = file.substring(file.lastIndexOf("\\") + 1).substring(file.lastIndexOf("/") + 1);
      $(".__file-input-filename", $(this).parent()).html(filename);
    })
    
  });
    
    
      
  $("input.save-file").each(function(){
    $(this).wrap('<div style="position:relative; height:100%"></div>');
    $(this).css({position:"relative", opacity:0, height:"inherit", cursor:"pointer"});
    $(this).before('<input type="button" value="'+$(this).attr("value")+'" class="btn btn-primary" style="position:absolute; width:100%">');
    
    $(this).on("change", function(){
      var file = $(this).val();
      var filename = file.substring(file.lastIndexOf("\\") + 1).substring(file.lastIndexOf("/") + 1);
      $(".__file-input-filename", $(this).parent()).html(filename);
    })
    
  });
    

    
    
});
