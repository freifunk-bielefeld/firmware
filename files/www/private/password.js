
document.getElementById("p1").focus();

$('#apply_button').click(function() {
  p1=$('#p1').val();
  p2=$('#p2').val();
  
  $('#p1').val("");
  $('#p2').val("");
  
  $.post("/cgi-bin/password", { func : "set_password", pass1 : p1, pass2 : p2 }, function(data){
      $('#status').text(data);
  })
})
