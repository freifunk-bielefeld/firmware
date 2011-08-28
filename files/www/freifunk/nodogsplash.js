$.get("/cgi-bin/nodogsplash", { func: "ndsctl_status" }, function(data){
    $('#data').text(data);
});