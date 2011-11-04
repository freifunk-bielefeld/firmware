$.get("/cgi-bin/nodogsplash", { func: "ndsctl_status" }, function(data){
    $('#ndsctl_status').text(data);
});