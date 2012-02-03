
$.post("/cgi-bin/info", { func: "uname" }, function(data){
    $('#uname').text(data);
});

$.post("/cgi-bin/info", { func: "uptime" }, function(data){
    $('#uptime').text(data);
});