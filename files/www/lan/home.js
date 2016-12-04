
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

function formatSpeed(bytes) {
	var fmt = formatSize(bytes);
	return (fmt == "-") ? "-" : (fmt + "/s");
}

function init() {
	send("/cgi-bin/home", { }, function(data) {
		var obj = fromUCI(data).misc.data;
		for(var key in obj) {
			var value = obj[key];

			if(key == 'stype') {
				continue;
			}

			// for data volume
			if(key.endsWith("_data")) {
				value = formatSize(value);
			}

			// for transfer speed
			if(key.endsWith("_speed")) {
				value = formatSpeed(value);
			}

			//for addresses
			if(typeof(value) == 'object') {
				value = "<ul><li>"+value.join("</li><li>")+"</li></ul>"
			}

			setText(key, value);
		}
	});

	addHelpText($("system"), "Eine \xdcbersicht \xfcber den Router.");
	addHelpText($("freifunk"), "Das \xf6ffentliche Freifunknetz..");
	addHelpText($("lan"), "Das private Netz bzw. LAN.");
	addHelpText($("wan"), "Das Netz \xfcber dass das Internet erreicht wird.");
	addHelpText($("software"), "Einige installierte Softwareversionen.");
	addHelpText($("freifunk_user_count"), "Die Anzahl der Nutzer an diesem Router in den letzten zwei Stunden.");
	addHelpText($("lan_user_count"), "Die Anzahl der Nutzer an diesem Router in den letzten zwei Stunden.");
	addHelpText($("vpn_server"), "Der VPN-Server im Internet, mit dem der Knoten verbunden ist.");
}
