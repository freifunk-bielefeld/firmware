
/*
 * All required uci packages are stored variable uci.
 * The GUI code displayes and manipulated this variable.
 */
var uci = {};
var wifi_status = {};

var gid = 0;
var net_options = [["LAN", "lan"], ["Freifunk", "freifunk"], ["Mesh", "mesh"], ["WAN", "wan"], ["None", "none"]];
var txpower_choices = [
["20 dBm (100 mW)", "20"],
["19 dBm (79 mW)", "19"],
["18 dBm (63 mW)", "18"],
["17 dBm (50 mW)", "17"],
["16 dBm (39 mW)", "16"],
["15 dBm (31 mW)", "15"],
["14 dBm (25 mW)", "14"],
["13 dBm (19 mW)", "13"],
["12 dBm (15 mW)", "12"],
["11 dBm (12 mW)", "11"],
["10 dBm (10 mW)", "10"],
["9 dBm (7 mW)", "9"],
["8 dBm (6 mW)", "8"],
["6 dBm (5 mW)", "6"],
["5 dBm (3 mW)", "5"],
["4 dBm (2 mW)", "4"],
["0 dBm (1 mW)", "0"],
["auto", "auto"]
];

function init()
{
	send("/cgi-bin/misc", { func : "wifi_status" }, function(data) {
		wifi_status = JSON.parse(data);
		send("/cgi-bin/network", { func : "get_settings" }, function(data) {
			uci = fromUCI(data);
			rebuild_other();
			rebuild_assignment();
			rebuild_wifi();
			rebuild_switches();
			adv_apply();
		});
	});
}

function updateFrom(src)
{
	var obj = {};
	collect_inputs(src, obj);
	for (var name in obj) {
		var value = obj[name];
		var path = name.split('#');

		var pkg = path[0];
		var sec = path[1];
		var opt = path[2];

		uci[pkg].pchanged = true;
		uci[pkg][sec][opt] = value
	}
}

function getChangeModeAction(ifname)
{
	return function(e) {
		var src = (e.target || e.srcElement);
		var mode = (src.data || src.value);
		delNetSection(ifname);
		addNetSection(ifname, mode);
	};
}

function appendSetting(p, path, value, mode)
{
	var id = path.join('#');
	var b;
	var cfg = path[0]
	var name = path[path.length-1];
	switch (name)
	{
	case "country":
		b = append_input(p, "Land", id, value);
		addClass(b.lastChild, "adv_disable");
		break;
	case "channel":
		var channels = [1,2,3,4,5,6,7,8,9,10,11,12];
		if (value > 35) channels = [36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140];
		b = append_selection(p, "Kanal", id, value, channels);
		addClass(b.lastChild, "adv_disable");
		addHelpText(b, "Der Kanal auf dem die WLAN-Karte sendet. Bitte denk daran, dass sich Router nicht sehen k\xf6nnen wenn beide Seiten auf unterschiedlichen Kan\xe4len funken. Der erste Kanal ist daher zu empfehlen.");
		break;
	case "txpower":
		value = value ? value : 'undefined';
		b = append_selection(p, "Sendeleistung", id, value, txpower_choices);
		addHelpText(b, "Die Sendeleistung in dBm. Strahlungsleistung = Sendeleistung - Kabeld\xe4mpfung + Antennengewinn.\nAndere Werte m\xfcssen manuell eingetragen werden. Achtung! Beim Tausch der Antennen muss die Sendeleistung entsprechend angepasst werden!");
		addClass(b, "adv_hide");
		break;
	case "mode":
		if (!inArray(mode, ["wan", "none"]))
			return;
		b = append_selection(p, "Modus", id, value, [["Client", "sta"],["AccessPoint", "ap"]]);
		addHelpText(b, "In einem anderen Netz anmelden (Client) oder das Anmelden anderer Ger\xe4te zulassen (AccessPoint).");
		break;
	case "encryption":
		if (!inArray(mode, ["wan", "lan", "none"]))
			return;
		b = append_selection(p, "Verschl\xfcsselung", id, value, [["Keine", "none"],["WPA", "psk"], ["WPA2", "psk2"]]);
		break;
	case "key":
		if (!inArray(mode, ["wan", "lan", "none"]))
			return;
		b = append_input(p, "Passwort", id, value);
		addInputCheck(b.lastChild, /^[\S]{8,32}$/, "Bitte nur ein Passwort aus mindestens acht sichbaren Zeichen verwenden.");
		break;
	case "hwmode":
		if (value == "11g") {
			value = "802.11g (2.4 GHz)";
		} else if (value == "11a") {
			value = "802.11a (5 GHz)";
		} else {
			value = "802." + value;
		}
		b = append_label(p, "Modus", value);
		break;
	case "mesh_id":
		b = append_input(p, "Mesh ID", id, value);
		if (!inArray(mode, ["wan", "lan", "none"]))
			addClass(b.lastChild, "adv_disable");
		addInputCheck(b.lastChild, /^[^\x00-\x1F\x80-\x9F]{3,30}$/, "Mesh ID ist ung\xfcltig.");
		break;
	case "ssid":
		b = append_input(p, "SSID", id, value);
		if (!inArray(mode, ["wan", "lan", "none"]))
			addClass(b.lastChild, "adv_disable");
		addInputCheck(b.lastChild, /^[^\x00-\x1F\x80-\x9F]{3,30}$/, "SSID ist ung\xfcltig.");
		break;
/*
	case "macaddr":
		if (path[1] != "freifunk") return;
		b = append_input(p, "MAC-Adresse", id, value);
		addInputCheck(b.lastChild,/^((([0-9a-f]{2}:){5}([0-9a-f]{2}))|)$/, "Ung\xfcltige MAC-Adresse.");
		addHelpText(b, "Die MAC-Adresse identifiziert den Knoten. Bei einem leeren Wert w\xe4hlt der Router selber einen aus.");
		break;
*/
	case "mesh_on_wan":
		b = append_radio(p, "Mesh-On-WAN", id, value, [["Ja", "1"], ["Nein", "0"]]);
		onDesc(b, "INPUT", function(e) {
			e.onclick = function(e) {
				var src = (e.target || e.srcElement);
				var val = (src.data || src.value);
				if (val != value) {
					if (val == "1") {
						uci.network['wan_mesh'] = {"stype":"interface", "ifname" : "@wan", "proto" : "batadv", "mesh" : "bat0", "mesh_no_rebroadcast" : "1"};
					} else {
						delete uci.network['wan_mesh'];
					}
					uci.network.pchanged = true;
				}
			}
		});
		addHelpText(b, "Diese Funktion schickt die Mesh-Pakete auf das Netz am WAN-Anschluss. Bitte beachten, dass diese Broadcast-Pakete im WAN-Netz befindliche WLAN APs negativ beeinflusst.");
		break;
	case "disabled":
		b = append_radio(p, "Deaktiviert", id, value, [["Ja", "1"], ["Nein", "0"]]);
		break;
	default:
		return;
	}

	b.id = id; // Needed for updateFrom.
	b.onchange = function() {
		updateFrom(b);
	};

	return b;
}

function getInterfaceMode(ifname)
{
	var n = uci.network;

	if (inArray(ifname, split(n.freifunk.ifname)))
		return "freifunk";

	if (inArray(ifname, split(n.lan.ifname)))
		return "lan";

	if (inArray(ifname, split(n.wan.ifname)))
		return "wan";

	if (config_find(n, {"ifname" : ifname, "proto" : "batadv"}))
		return "mesh";

	return "none";
}

function getWifiMode(id)
{
	var obj = uci.wireless[id];

	if (obj.network == "freifunk") return "freifunk";
	if (obj.network == "lan") return "lan";
	if (obj.network == "wan") return "wan";
	if (obj.mode == "mesh") return "mesh";

	return "none";
}

function rebuild_other()
{
	var root = $("other");
	removeChilds(root);
	hide(root);

	var fs = append_section(root, "Sonstiges");

	if ('network' in uci) {
		var n = uci['network'];
		appendSetting(fs, ['network', 'freifunk', "macaddr"], n['freifunk']["macaddr"]);
	}

	if ('freifunk' in uci) {
		var f = uci.freifunk;
		var i = firstSectionID(f, "settings");
		appendSetting(fs, ['freifunk', i, "mesh_on_wan"], f[i]["mesh_on_wan"]);
	}

	addClass(root, "adv_hide");
}

function rebuild_assignment()
{
	var root = $("assignment");
	removeChilds(root);
	hide(root);

	var fs = append_section(root, "Anschl\xfcsse");
	addHelpText(fs, "Einzelne Anschl\xfcsse des Router die nicht als Teil des Switches oder WLANS zu identifizieren sind.");

	var ignore = ["local-node", "fastd_mesh", "bat0", "lo"];
	var ifnames = [];

	// remove dummy-interface
	switch (uci.misc.data.model)	{
		case 'tp-link-tl-wr941n-nd-v1':
		case 'tp-link-tl-wr941n-nd-v2':
		case 'tp-link-tl-wr941n-nd-v3':
			ignore.push("eth0");
	}

	// Collect all interfaces.
	config_foreach(uci.network, "interface", function(sid, sobj) {
		if (sobj.ifname) ifnames = ifnames.concat(split(sobj.ifname));
	});

	// Ignore switch interfaces.
	config_foreach(uci.network, "switch", function(sid, sobj) {
		var swinfo = collect_switch_info(sobj.name);
		config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
			ignore.push(getInterfaceName(vid, swinfo));
		});
	});

	// Ignore wlan interfaces.
	config_foreach(uci.wireless, "wifi-iface", function(sid, sobj) {
		if (sobj.ifname) ignore.push(sobj.ifname);
	});

	ifnames = uniq(ifnames);
	ifnames.sort();
	for (var i in ifnames)
	{
		var ifname = ifnames[i];
		if ((ifname.length == 0) || inArray(ifname, ignore) || ifname[0] == "@" ) {
			continue;
		}
		var mode = getInterfaceMode(ifname);
		var entry = append_selection(fs, ifname, "set_mode_"+ifname, mode, net_options);
		entry.onchange = getChangeModeAction(ifname);
		show(root);
	}
}

function collect_wifi_info(device)
{
	var modes = [];
	config_foreach(uci.wireless, "wifi-iface", function(id, obj) {
		if (device == obj.device)
			modes.push(getWifiMode(id));
	});
	return {"modes" : modes};
}

function modeName(mode) {
	for (var i in net_options) {
		if (net_options[i][1] == mode) {
			return net_options[i][0];
		}
	}
	return mode;
}

function addNetSection(ifname, mode)
{
	var n = uci.network;

	switch (mode) {
	case "wan":
		n.wan.ifname = addItem(n.wan.ifname, ifname);
		break;
	case "lan":
		n.lan.ifname = addItem(n.lan.ifname, ifname);
		break;
	case "freifunk":
		n.freifunk.ifname = addItem(n.freifunk.ifname, ifname);
		break;
	case "mesh":
		var net = ifname.replace(".", "_");
		n[net] = {"stype":"interface","ifname":ifname,"mtu":"1406","proto":"batadv","mesh":"bat0","mesh_no_rebroadcast":"1"};
		break;
	case "none":
		var net = ifname.replace(".", "_");
		n[net] = {"stype":"interface","ifname":ifname,"proto":"none"};
		break;
	default:
		return;
	}

	n.pchanged = true;
}

function delNetSection(ifname)
{
	var n = uci.network;

	config_foreach(n, "interface", function(id, obj) {
		if (obj.ifname == ifname && !inArray(id, ['wan', 'lan', 'freifunk']))
			delete n[id];
	});

	n.wan.ifname = removeItem(n.wan.ifname, ifname);
	n.lan.ifname = removeItem(n.lan.ifname, ifname);
	n.freifunk.ifname = removeItem(n.freifunk.ifname, ifname);

	n.pchanged = true;
}

function randomString(length) {
	var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
	var str = '';
	for (var i = 0; i < length; i++) {
		var rnum = Math.floor(Math.random() * chars.length);
		str += chars.substring(rnum,rnum+1);
	}
	return str;
}

function addWifiSection(device, mode)
{
	var w = uci.wireless;
	var n = uci.network;
	var s = config_find(uci.freifunk, {"stype" : "settings"});
	var ifname = device+"_"+mode;

	// Add section to /etc/config/wireless
	switch (mode)
	{
	case "wan":
		// Only works if interface is not in a bridge!
		w[ifname] = {"device":device,"stype":"wifi-iface","mode":"sta","ssid":"OtherNetwork","key":"password_for_OtherNetwork","encryption":"psk2", "network":"wan"};
		break;
	case "mesh":
		var net = ifname.replace(".", "_");
		// 802.11s
		w[ifname] = {"device":device,"stype":"wifi-iface","mode":"mesh","mesh_id":s.default_mesh_id,"mesh_fwding":0,"network":net};
		// Connected via option network
		n[net] = {"stype":"interface","mtu":"1532","proto":"batadv","mesh":"bat0"};
		n.pchanged = true;
		break;
	case "freifunk":
		w[ifname] = {"device":device,"stype":"wifi-iface","mode":"ap","ssid":(s.community+".freifunk.net"),"network":"freifunk"};
		break;
	case "lan":
		w[ifname] = {"device":device,"stype":"wifi-iface","mode":"ap","ssid":"MyNetwork","key":randomString(10),"encryption":"psk2","network":"lan"};
		break;
	default:
		return alert("mode error '"+mode+"' "+device);
	}

	w.pchanged = true;
}

function delWifiSection(dev, mode)
{
	var w = uci.wireless;
	var n = uci.network;

	config_foreach(w, "wifi-iface", function(id, obj) {
		if (obj.device == dev && getWifiMode(id) == mode) {
			if (mode == "mesh") {
				delete n[obj.network];
				n.pchanged = true;
			}
			delete w[id];
			w.pchanged = true;
		}
	});
}

function getWifiInterfaceState(dev, wid)  {
	var obj = wifi_status[dev];

	if (!obj.up) {
		return "Inaktiv";
	}

	var interfaces = obj['interfaces'];
	for (var i = 0; interfaces && i < interfaces.length; i++) {
		var e = interfaces[i];
		if (e.section == wid) {
			return ('ifname' in e) ? "Aktiv" : "Fehler";
		}
	}
	return "Unbekannt";
}

function countWifi(mode, wmode) {
	var n = 0;
	config_foreach(uci.wireless, "wifi-iface", function(wid, wobj) {
		if (wmode && wobj['mode'] != wmode) {
			return;
		}
		if (getWifiMode(wid) == mode) n++;
        });
	return n;
}

function countOther(mode) {
	return split(uci['network'][mode]['ifname']).length;
}

// Make sure we use only one interface for WAN
// when using WAN of Wifi. Otherwise it won't work.
function setWanMode(mode) {
	var changed = (uci['network']['wan']['mode'] == mode);
	if (mode == 'static' || mode == 'bridge') {
		uci['network']['wan']['mode'] = mode;
		uci['network'].pchanged = changed;
	}
}

function rebuild_wifi()
{
	var root = $("wireless");
	removeChilds(root);

	// Print wireless sections.
	config_foreach(uci.wireless, "wifi-device", function(dev, obj) {
		var fs = append_section(root, "Wireless '"+dev+"'", dev);
		var info = collect_wifi_info(dev);

		for (var sid in obj)
			appendSetting(fs, ['wireless', dev, sid], obj[sid]);

		var lan_help = "<b>LAN</b>: Aktiviert ein privates, passwortgesch\xfctztes WLAN-Netz mit Zugang zum eigenen Internetanschluss.";
		var freifunk_help = "<b>Freifunk</b>: Der WLAN-Zugang zum Freifunk-Netz.";
		var mesh_help = "<b>Mesh</b>: Das WLAN-Netz \xfcber das die Router untereinander kommunizieren.";
		var wan_help = "<b>WAN</b>: Erm\xf6glicht den Internetzugang eines anderen, herk\xf6mmlichen Routers zu nutzen (nutzt WDS).";
		var mode_checks = append_check(fs, "Modus", dev+"_mode", info.modes, [["LAN","lan", lan_help], ["Freifunk","freifunk", freifunk_help], ["Mesh", "mesh", mesh_help], ["WAN", "wan", wan_help]]);
		var parent = append(fs, "div");

		// Print wireless interfaces.
		config_foreach(uci.wireless, "wifi-iface", function(wid, wobj) {
			if (wobj.device != dev) return;

			var mode = getWifiMode(wid);
			var title = (mode == "none") ? "'"+wobj.network+"'" : modeName(mode);
			var entry = append_section(parent, title, "wireless_"+dev+"_"+mode);

			for (var opt in wobj)
				appendSetting(entry, ["wireless", wid, opt], wobj[opt], mode);

			var state = getWifiInterfaceState(dev, wid);
			var b = append_label(entry, "Status", state);
			addHelpText(b, "Funktioniert das Interface? Manche WLAN-Treiber k\xf6nnen z.B kein AccessPoint und Mesh gleichzeitig.");

			if (mode == "none") {
				append_button(entry, "L\xf6schen", function() {
					delWifiSection(dev, mode);
					rebuild_wifi();
					adv_apply();
				});
			}
		});

		// Add or remove a wifi interface.
		onDesc(mode_checks, "INPUT", function(e) {
			e.onclick = function(e) {
				var src = (e.target || e.srcElement);
				var mode = (src.data || src.value);

				if (src.checked) {
					if (obj.type != "mac80211")
						alert("Diese Betriebsweise wird von diesem Chipsatz nicht unterst\xfctzt!");
					addWifiSection(dev, mode);
				} else {
					delWifiSection(dev, mode);
				}
				rebuild_wifi();
				adv_apply();
			};
		});
	});
}

function collect_switch_info(device)
{
	var obj = {
		device : device
	};

	// Portmap is a mapping of label to internal port number.
	// Label starting with eth are not displayed and treated as physical interfaces.
	switch (uci.misc.data.model)
	{
		case 'tp-link-tl-wdr3600-v1':
		case 'tp-link-tl-wdr4300-v1':
			obj.map = [['eth0',0],['WAN',1],['LAN1',2],['LAN2',3],['LAN3',4],['LAN4',5]];
			break;
		case 'tp-link-tl-wr1043n-nd-v1':
			obj.map = [['eth0',5],['WAN',0],['LAN1',1],['LAN2',2],['LAN3',3],['LAN4',4]];
			break;
		case 'tp-link-tl-wr1043n-nd-v2':
		case 'tp-link-tl-wr1043n-nd-v3':
			obj.map = [['eth1',0],['WAN',5],['LAN1',4],['LAN2',3],['LAN3',2],['LAN4',1]];
			break;
		case 'tp-link-tl-wr1043n-nd-v4':
			obj.map = [['eth0',0],['WAN',5],['LAN1',4],['LAN2',3],['LAN3',2],['LAN4',1]];
			break;
		case 'tp-link-tl-wdr3500-v1':
		case 'tp-link-tl-wr741n-nd-v4':
		case 'tp-link-tl-wr841n-nd-v3':
		case 'tp-link-tl-wr841n-nd-v5':
			obj.map = [['eth0',0],['LAN1',2],['LAN2',3],['LAN3',4],['LAN4',1]];
			break;
		case 'tp-link-tl-wr841n-nd-v8':
		case 'tp-link-tl-mr3420-v2':
			obj.map = [['eth1',0],['LAN1',2],['LAN2',3],['LAN3',4],['LAN4',1]];
			break;
		case 'tp-link-tl-wr941n-nd-v5':
		case 'tp-link-tl-wr941n-nd-v6':
			obj.map = [['eth1',0],['LAN1',4],['LAN2',3],['LAN3',2],['LAN4',1]];
			break;
		case 'tp-link-tl-wr841n-nd-v9':
		case 'tp-link-tl-wr841n-nd-v10':
		case 'tp-link-tl-wr841n-nd-v11':
			obj.map = [['eth0',0],['LAN1',4],['LAN2',3],['LAN3',2],['LAN4',1]];
			break;
		case 'tp-link-tl-wr842n-nd-v1':
		case 'tp-link-tl-wr842n-nd-v2':
		case 'tp-link-tl-wr842n-nd-v3':
			obj.map = [['eth0',0],['LAN1',4],['LAN2',3],['LAN3',2],['LAN4',1]];
			break;
		case 'tp-link-tl-wr841n-nd-v7':
		case 'tp-link-tl-mr3420-v1':
			obj.map = [['eth0',0],['LAN1',1],['LAN2',2],['LAN3',3],['LAN4',4]];
			break;
		case 'tp-link-cpe210-v1-0':
		case 'tp-link-cpe210-v1-1':
		case 'tp-link-cpe220-v1-0':
		case 'tp-link-cpe510-v1-0':
		case 'tp-link-cpe510-v1-1':
		case 'tp-link-cpe520-v1-0':
			obj.map = [['eth0',0],['LAN0',5],['LAN1',4]];
			break;
		case 'tp-link-archer-c5-v1':
		case 'tp-link-archer-c7-v2':
			obj.map = [['eth1',0],['LAN1',2],['LAN2',3],['LAN3',4],['LAN4',5],['eth0',6],['WAN',1]];
			break;
		case 'd-link-dir-615-d':
		case 'd-link-dir-615-h1':
		case 'd-link-dir-615-h2':
			obj.map = [['eth0',6],['LAN1',3],['LAN2',2],['LAN3',1],['LAN4',0],['Internet',4]];
			break;
		case 'd-link-dir-860l-b1':
			obj.map = [['eth0',6],['LAN1',1],['LAN2',2],['LAN3',3],['LAN4',4],['WAN',0]] ;
			break;
	}

	return obj;
}

function getSwitchVid(port, swinfo)
{
	var found_vid;
	config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
		if (vobj.device == swinfo.device && vobj.ports.indexOf(port) != -1) {
			found_vid = vid;
			return false;
		}
	});
	return found_vid;
}

function countPortUse(port, swinfo)
{
	var count = 0;
	config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
		if (vobj.device == swinfo.device) {
			count += (vobj.ports.indexOf(port) != -1);
		}
	});
	return count;
}

function renameInterface(old_ifname, new_ifname)
{
	for (var i in uci.network) {
		var ifname = split(uci.network[i].ifname);
		var index = ifname.indexOf(old_ifname);
		if (index !== -1) {
			ifname[index] = new_ifname;
			uci.network[i].ifname = ifname.join(' ');
		}
	}
}

function replaceSwitchPort(fromPort, toPort, swinfo)
{
	var vid = getSwitchVid(fromPort, swinfo);
	if (vid) {
		var vobj = uci.network[vid];
		var fromIfname = getInterfaceName(vid, swinfo);
		vobj.ports = replaceItem(vobj.ports, fromPort, toPort);
		var toIfname = getInterfaceName(vid, swinfo);
		renameInterface(fromIfname, toIfname);
	}
}

function fixPortTag(swinfo)
{
	for (var i in swinfo.map) {
		var v = swinfo.map[i];
		if (v[0].startsWith("eth"))
		{
			var bport = v[1];
			if (countPortUse(bport, swinfo) > 1) {
				replacePort(bport, bport + "t", swinfo);
			} else {
				replacePort(bport+"t", bport, swinfo);
			}
		}
	}
}

function getInterfaceName(vid, swinfo)
{
	var vobj = uci.network[vid];
	for (var i in swinfo.map) {
		var v = swinfo.map[i];
		if (v[0].startsWith("eth")) {
			if (vobj.ports.indexOf(""+v[1]+"t") != -1) {
				return v[0] + "." + vobj.vlan;
			}
			else if (vobj.ports.indexOf(v[1]) != -1) {
				return v[0];
			}
		}
	}
}

// Get base port.
function getBasePort(port, swinfo)
{
	var bport;
	var found = false;
	var map = swinfo.map;
	for (var i in map) {
		var v = map[i];
		if (v[0].startsWith("eth")) {
			bport = v[1];
		}
		if (v[1] == port) {
			return bport;
		}
	}
	// A default port must exist.
}

function removePort(port, mode, swinfo)
{
	var vid = getSwitchVid(port, swinfo);
	var bport = getBasePort(port, swinfo);
	var ifname = getInterfaceName(vid, swinfo);
	var vobj = uci.network[vid];

	vobj.ports = removeItem(vobj.ports, port);
	// Only the base port or no port at all is left => remove section.
	if (split(vobj.ports).length < 2) {
		delNetSection(ifname);
		delete uci.network[vid];
	}

	if (countPortUse(bport, swinfo) < 2) {
		// Untag base port.
		replaceSwitchPort(bport+"t", bport, swinfo);
	}

	uci.network.pchanged = true;
}

function addPort(port, mode, swinfo)
{
	var bport = getBasePort(port, swinfo);

	var vlans = [];
	var added = config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
		vlans.push(parseInt(vobj.vlan));
		if (vobj.device == swinfo.device && vobj.ports.indexOf(bport) != -1) {
			var ifname = getInterfaceName(vid, swinfo);
			if (getInterfaceMode(ifname) == mode) {
				vobj.ports = addItem(vobj.ports, port);
				return true;
			}
		}
	});

	if (!added) {
		// Get smallest unused vlan number > 0.
		var vlan = vlans.sort(function(a, b){return a-b}).reduce(function(r, v, i) { return (r < vlans.length) ? r : ((i+1 != v) ? i+1 : r); }, vlans.length + 1);

		var ports = "" + bport;
		if (countPortUse(bport, swinfo) > 0) {
			// Tag base port.
			replaceSwitchPort(bport, bport + "t", swinfo);
			ports += "t " + port;
		} else {
			ports += " " + port;
		}

		var vid = "cfg"+(++gid);
		uci.network[vid] = { "stype" : "switch_vlan", "device" : swinfo.device, "vlan" : ""+vlan, "ports" : ports };

		var ifname = getInterfaceName(vid, swinfo);
		addNetSection(ifname, mode);
	}

	uci.network.pchanged = true;
}

function getChangeHandler(port, mode, swinfo)
{
	return function(e) {
		var src = (e.target || e.srcElement);
		var mode = (src.data || src.value);

		removePort(port, mode, swinfo);
		addPort(port, mode, swinfo);

		rebuild_switches();
	};
}

function rebuild_switches()
{
	var root = $("switches");
	removeChilds(root);
	addHelpText(root, "Konfiguration der Anschl\xfcsse/Ports am Router. Bitte darauf achten, dass der Zugang auf diese Seite normalerweise nur \xfcber auf 'LAN' gestellte Anschl\xfcsse m\xf6glich ist.");

	config_foreach(uci.network, "switch", function(sid, sobj) {
		var swinfo = collect_switch_info(sobj.name);
		var sfs = append_section(root, "Switch '"+swinfo.device+"'");

		if (!swinfo.map) {
			var p = append(sfs, 'div');
			var label = append(p, "label");
			label.innerHTML = "Keine Port-Konfiguration m\xf6glich.";
		} else for (var i in swinfo.map) {
			var name = swinfo.map[i][0];
			var port = swinfo.map[i][1];
			if (name.startsWith("eth")) {
				continue;
			}
			var vid = getSwitchVid(port, swinfo);
			var ifname = getInterfaceName(vid, swinfo);
			var mode = getInterfaceMode(ifname);
			var bport = getBasePort(port, swinfo);

			var p = append(sfs, 'div');
			var label = append(p, "label");
			label.innerHTML = name + ":";

			var select = append_options(p, "port_"+port, mode, net_options);
			select.onchange = getChangeHandler(port, mode, swinfo);
		}
	});
}

/*
 * WAN over wifi works only if the wifi interface
 * is not in a bridge. Switch to static in this case.
 * Also check if there are other WAN interfaces
 *since only a bridge would support that.
 */
function checkWifiWan() {
	var pre_mode = uci.network.wan.type;
	var new_mode = 'bridge';

	if (countWifi('wan', 'sta')) {
		if ((countWifi('wan') + countOther('wan')) > 1) {
			return false;
		}
		new_mode = 'static';
	}

	if (pre_mode != new_mode) {
		uci.network.wan.type = new_mode;
		uci.network.pchanged = true;
	}

	return true;
}

function save_data()
{
	if (!checkWifiWan()) {
		alert("WAN \xfcber WLAN funktioniert nur wenn dieser als einziger Anschluss f\xfcr WAN verwendet wird! Bitte korrigieren.");
		return;
	}

	for (var name in uci) {
		var obj = uci[name];
		if (!obj.pchanged)
			continue;

		var data = toUCI(obj);
		send("/cgi-bin/misc", { func : "set_config_file", name : name, data : data },
			function(data) {
				$('msg').innerHTML = data;
				$('msg').focus();
				init();
			}
		);
	}
}
