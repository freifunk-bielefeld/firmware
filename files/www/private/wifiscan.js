
function fetch(regex, data)
{
	var array = [];
	while(item = regex.exec(data))
		array.push(item[1]);
	return array;
}

function wifi_scan()
{
	var s = get('wifi_selection');
	var device = s.options[s.selectedIndex].value;

	send("/cgi-bin/misc", {func:'wifiscan', device:device}, function(data) {
		var ssids = fetch(/SSID: (.*)\n/g, data);
		var channels = fetch(/channel (.*)\n/g, data);
		var signals = fetch(/signal: (.*)\n/g, data);
		var capabilities = fetch(/capability: (.*)\n/g, data);

		var table = get("scan_table");
		removeChilds(table);
		table.innerHTML = "<tr><th>SSID</th><th>Kanal</th><th>Signal</th><th>Typ</th></tr>";

		for(var i = 0; i < ssids.length; ++i)
		{
			var tr = append(table, 'tr');
			append(tr, 'td').innerHTML = ssids[i];
			append(tr, 'td').innerHTML = channels[i];
			append(tr, 'td').innerHTML = signals[i];
			append(tr, 'td').innerHTML = /IBSS/.test(capabilities[i]) ? "  adhoc" : "  ap";
		}
	});
}

/*
* Create a selection of wireless devices
* represented as the first interface found.
*/
send("/cgi-bin/misc", {func:'wifiscan_info'}, function(data) {
	var uci = fromUCI(data);
	var list = get('wifi_selection');

	config_foreach(uci.wireless, "wifi-device", function(sid, sobj) {
		var device = sid;
		config_foreach(uci.wireless, "wifi-iface", function(sid, sobj) {
			if(sobj.device == device)
			{
				var o = append(list, 'option');
				o.innerHTML = wifi_device;
				o.value = sobj.ifname;
				return 1;
			}
		});
	});
});
