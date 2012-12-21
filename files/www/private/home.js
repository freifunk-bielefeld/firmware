
send("/cgi-bin/misc", { func: "status" }, function(data) {
	var obj = parseUCI(data).status.data;
	for(var key in obj)
		setText(key, obj[key]);
});
