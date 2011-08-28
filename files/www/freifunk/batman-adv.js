$.get("/cgi-bin/dispatch", { func: "get_batman" }, function(data){
    $('#data').text(data);
});