
function formatSize(bytes) {
	if(typeof bytes === "undefined" || bytes == "") {
		return "-";
	} else if (bytes < 1000) {
		return bytes + "  B";
	} else if (bytes < 1000*1000) {
		return (bytes/ 1000.0).toFixed(0)  + " KB";
	} else if (bytes < 1000*1000*1000) {
		return (bytes/1000.0/1000.0).toFixed(1)  + " MB";
	} else {
		return (bytes/1000.0/1000.0/1000.0).toFixed(2) + " GB";
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

addHelpText($("system"), "Eine \xdcbersicht \xfcber den Router.");
addHelpText($("public"), "Das \xf6ffentliche Freifunknetz..");
addHelpText($("private"), "Das private Netz bzw. LAN.");
addHelpText($("wan"), "Das Netz \xfcber dass das Internet erreicht wird.");
addHelpText($("software"), "Einige installierte Softwareversionen.");
addHelpText($("public_user_count"), "Die Anzahl der Nutzer an diesem Router in den letzten zwei Stunden.");
addHelpText($("private_user_count"), "Die Anzahl der Nutzer an diesem Router in den letzten zwei Stunden.");
