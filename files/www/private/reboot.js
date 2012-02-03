$('#reboot').click(function() {
  $.post("/cgi-bin/misc", { func : "reboot" }, function(data){
      $('#status').text("(I) Rebooting now!");
  })
})