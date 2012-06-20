
send("/cgi-bin/misc", { func: "status" }, function(data) {
    var obj = parseJSON(data);
    for(var key in obj) setText(key, obj[key]);
});
