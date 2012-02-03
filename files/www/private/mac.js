
$.post("/cgi-bin/mac", { func: "get_mac" }, function(data){
    $('#mac').val(data);
});

$('#apply_button').click(function() {
  mac=$('#mac').val();
  
  $.post("/cgi-bin/mac", { func : "set_mac", new_mac : mac }, function(data){
      $('#status').text(data);
  })
})