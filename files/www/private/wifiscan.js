
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

function add_list_entry(device, ifname) {
	var list = $('wifiscan_selection');
	var o = append(list, 'option');
	o.style.paddingRight = "1em";
	o.innerHTML = device;
	o.value = ifname;
}

/*
* Create a selection of wireless devices
* represented as the first interface found.
*/
function init() {
	send("/cgi-bin/misc", {func:'wifiscan_info'}, function(data) {
		var uci = fromUCI(data);
		config_foreach(uci.wireless, "wifi-device", function(device, sobj) {
			var found = false;
			config_foreach(uci.wireless, "wifi-iface", function(sid, sobj) {
				if(sobj.device == device && sobj.ifname) {
					add_entry(device, sobj.ifname);
					found = true;
					return 1;
				}
			});

			if(!found) switch(device) {
				case "radio0": add_list_entry(device, "wlan0"); break;
				case "radio1": add_list_entry(device, "wlan1"); break;
			}
		});
	});
}
