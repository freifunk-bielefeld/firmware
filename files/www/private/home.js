
function formatSize(bytes) {
	if(typeof bytes === "undefined" || bytes == "") {
		return "-";
	} else if (bytes < 1024) {
		return bytes + "  B";
	} else if (bytes < 1024*1024) {
		return (bytes/ 1024.0).toFixed(0)  + " KB";
	} else if (bytes < 1024*1024*1024) {
		return (bytes/1024.0/1024.0).toFixed(1)  + " MB";
	} else {
		return (bytes/1024.0/1024.0/1024.0).toFixed(2) + " GB";
	}
}

send("/cgi-bin/home", { }, function(data) {
	var obj = fromUCI(data).misc.data;
	for(var key in obj) {
		var value = obj[key];

		if(key == 'stype') {
			continue;
		}

		if(/_bytes$/.test(key)) {
			value = formatSize(value);
		}

		setText(key, value);
	}
});

addHelpText(get("system"), "Eine \xdcbersicht \xfcber den Router.");
addHelpText(get("public"), "Das \xf6ffentliche Freifunknetz..");
addHelpText(get("private"), "Das private Netz bzw. LAN.");
addHelpText(get("wan"), "Das Netz \xfcber dass das Internet erreicht wird.");
addHelpText(get("software"), "Einige installierte Softwareversionen.");
