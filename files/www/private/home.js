
send("/cgi-bin/misc", { func: "status" }, function(data) {
	var obj = fromUCI(data).misc.data;
	for(var key in obj)
		if(key != 'stype')
			setText(key, obj[key]);
});
