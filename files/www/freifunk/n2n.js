$.get("/cgi-bin/n2n", { func: "none" }, function(data){
    $('#text').text(data);
});