$.get("/cgi-bin/info", { func: "route" }, function(data){
    $('#data').text(data);
});