
function fetch(regex, data)
{
	var array = [];
	while(item = regex.exec(data))
		array.push(item[1]);
	return array;
}

function append_td(tr, value) {
	append(tr, 'td').innerHTML = value ? value : "?";
}

function wifi_scan()
{
	var s = $('wifiscan_selection');
	var device = s.options[s.selectedIndex].value;

	send("/cgi-bin/misc", {func:'wifiscan', device:device}, function(data) {
		var ssids = fetch(/SSID: (.*)\n/g, data);
		var channels = fetch(/channel (.*)\n/g, data);
		var signals = fetch(/signal: (.*)\n/g, data);
		var capabilities = fetch(/capability: (.*)\n/g, data);

		var tbody = $("wifiscan_tbody");
		removeChilds(tbody);

		for(var i = 0; i < ssids.length; ++i)
		{
			var tr = append(tbody, 'tr');
			append_td(tr, ssids[i]);
			append_td(tr, channels[i]);
			append_td(tr, signals[i]);
			append_td(tr, /IBSS/.test(capabilities[i]) ? "  adhoc" : "  ap");
		}

		var table = $('wifiscan_table');
		show(table);
	});
}

/*
* Create a selection of wireless devices
* represented as the first interface found.
*/
send("/cgi-bin/misc", {func:'wifiscan_info'}, function(data) {
	var uci = fromUCI(data);
	var list = $('wifiscan_selection');

	config_foreach(uci.wireless, "wifi-device", function(device, sobj) {
		config_foreach(uci.wireless, "wifi-iface", function(sid, sobj) {
			if(sobj.device == device)
			{
				var o = append(list, 'option');
				o.innerHTML = device;
				o.value = sobj.ifname;
				return 1;
			}
		});
	});
});
