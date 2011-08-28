$.get("/cgi-bin/dispatch", { func: "get_nodogsplash" }, function(data){
    $('#data').text(data);
});