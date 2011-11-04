$.get("/cgi-bin/info", { func: "route" }, function(data){
    $('#route').text(data);
});

$.get("/cgi-bin/info", { func: "ifconfig" }, function(data){
    $('#ifconfig').text(data);
});

$.get("/cgi-bin/info", { func: "freifunk_log" }, function(data){
    $('#freifunk_log').text(data);
});