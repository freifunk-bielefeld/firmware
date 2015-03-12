
/*
All required uci packages are stored variable uci.
The GUI code displayes and manipulated this variable.
*/
var uci = {};
var gid = 0;
var net_options = [["LAN", "lan"], ["Freifunk", "freifunk"], ["Mesh", "mesh"], ["WAN", "wan"], ["None", "none"]];

function init()
{
	send("/cgi-bin/network", { func : "get_settings" }, function(data) {
		uci = fromUCI(data);
		rebuild_other();
		rebuild_assignment();
		rebuild_wifi();
		rebuild_switches();
	});
}

function updateFrom(src)
{
	var obj = {};
	collect_inputs(src, obj);
	for(var name in obj)
	{
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
		var mode = src.value;
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
	switch(name)
	{
	case "country":
		b = append_input(p, "Land", id, value);
		if(!adv_mode)
			b.lastChild.disabled = "disabled";
		break;
	case "channel":
		var channels = [1,2,3,4,5,6,7,8,9,10,11,12];
		if(value > 35) channels = [36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140];
		b = append_selection(p, "Kanal", id, value, channels);
		if(!adv_mode)
			b.lastChild.disabled = "disabled";
		addHelpText(b, "Der Kanal auf dem die WLAN-Karte sendet. Bitte denk daran, dass sich Router nicht sehen k\xf6nnen wenn beide Seiten auf unterschiedlichen Kan\xe4len funken. Der erste Kanal ist daher zu empfehlen.");
		break;
	case "mode":
		if(!inArray(mode, ["wan", "none"]))
			return;
		b = append_selection(p, "Modus", id, value, [["Client", "sta"],["AccessPoint", "ap"]]);
		addHelpText(b, "In einem anderen Netz anmelden (Client) oder das Anmelden anderer Ger\xe4te zulassen (AccessPoint).");
		break;
	case "encryption":
		if(!inArray(mode, ["wan", "lan", "none"]))
			return;
		b = append_selection(p, "Verschl\xfcsselung", id, value, [["Keine", "none"],["WPA", "psk"], ["WPA2", "psk2"]]);
		break;
	case "key":
		if(!inArray(mode, ["wan", "lan", "none"]))
			return;
		b = append_input(p, "Passwort", id, value);
		addInputCheck(b.lastChild, /^[\S]{8,32}$/, "Bitte nur ein Passwort aus mindestens acht sichbaren Zeichen verwenden.");
		break;
	case "hwmode":
		b = append_label(p, "Modus", "802."+value);
		break;
	case "ssid":
		b = append_input(p, "SSID", id, value);
		if(!inArray(mode, ["wan", "lan", "none"]) && !adv_mode)
			b.lastChild.disabled = "disabled";
		addInputCheck(b.lastChild, /^[^\x00-\x1F\x80-\x9F]{3,30}$/, "SSID ist ung\xfcltig.");
		break;
	case "macaddr":
		if(!adv_mode || path[1] != "freifunk") return;
		b = append_input(p, "MAC-Adresse", id, value);
		addInputCheck(b.lastChild,/^((([0-9a-f]{2}:){5}([0-9a-f]{2}))|)$/, "Ung\xfcltige MAC-Adresse.");
		addHelpText(b, "Die MAC-Adresse identifiziert den Knoten. Bei einem leeren Wert w\xe4hlt der Router selber einen aus.");
		break;
	case "disabled":
		b = append_radio(p, "Deaktiviert", id, value, [["Ja", "1"], ["Nein", "0"]]);
		break;
	case "ports":
		var map = [];
		var tp = value.swinfo.tagged_port;
		var pm = value.swinfo.port_map;
		var v = (collectVLANs(value.swinfo.device).length > 1);
		for(var i in pm)
		{
			if(pm[i][0] == '_')
				map.push(['_', (v ? (tp+'t' ) : tp)]);
			else
				map.push(pm[i]);
		}
		b = append_check(p, value.ifname, id, split(value.ports), map);

		var select = append_options(p, "set_mode_"+value.ifname, mode, net_options);
		select.onchange = getChangeModeAction(value.ifname);
		break;
	default:
		return;
	}

	b.id = id; //needed for updateFrom
	b.onchange = function() {
		updateFrom(b);
	};

	return b;
}

function getNetMode(ifname)
{
	var n = uci.network;

	if(inArray(ifname, split(n.freifunk.ifname)))
		return "freifunk";

	if(inArray(ifname, split(n.lan.ifname)))
		return "lan";

	if(inArray(ifname, split(n.wan.ifname)))
		return "wan";

	if(config_find(n, {"ifname" : ifname, "proto" : "batadv"}))
		return "mesh";

	return "none";
}

function getWifiMode(id)
{
	var obj = uci.wireless[id];

	if(obj.network == "freifunk") return "freifunk";
	if(obj.network == "lan") return "lan";
	if(obj.network == "wan") return "wan";
	if(obj.mode == "adhoc") return "mesh";

	return "none";
}

function rebuild_other()
{
	var root = $("other");
	removeChilds(root);
	hide(root);

	var fs = append_section(root, "Sonstiges");

	if('network' in uci) {
		var n = uci['network'];
		var b = appendSetting(fs, ['network', 'freifunk', "macaddr"], n['freifunk']["macaddr"]);
		if(b) show(root);
	}
}

function rebuild_assignment()
{
	var root = $("assignment");
	removeChilds(root);
	hide(root);

	var fs = append_section(root, "Anschl\xfcsse");
	addHelpText(fs, "Einzelne Anschl\xfcsse des Router die nicht als Teil des Switches oder WLANS zu identifizieren sind.");

	var ignore = ["fastd_mesh", "bat0", "lo"];
	var ifnames = [];

	//collect all interfaces
	config_foreach(uci.network, "interface", function(sid, sobj) {
		if(sobj.ifname) ifnames = ifnames.concat(split(sobj.ifname));
	});

	//ignore switch interfaces
	config_foreach(uci.network, "switch", function(sid, sobj) {
		var swinfo = collect_switch_info(sobj.name);
		var vlans = collectVLANs(swinfo.device);
		config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
			var ifname = guess_vlan_ifname(swinfo, vobj.vlan, vlans.length);
			ignore.push(ifname);
		});
	});

	//ignore wlan interfaces
	config_foreach(uci.wireless, "wifi-iface", function(sid, sobj) {
		if(sobj.ifname) ignore.push(sobj.ifname);
	});

	ifnames = uniq(ifnames);
	ifnames.sort();
	for(var i in ifnames)
	{
		var ifname = ifnames[i];
		if((ifname.length == 0) || inArray(ifname, ignore) || ifname[0] == "@" )
			continue;
		var mode = getNetMode(ifname);
		var entry = append_selection(fs, ifname, "set_mode_"+ifname, mode, net_options);
		entry.onchange = getChangeModeAction(ifname);
		show(root);
	}
}

function collect_wifi_info(device)
{
	var modes = [];
	config_foreach(uci.wireless, "wifi-iface", function(id, obj) {
		if(device == obj.device)
			modes.push(getWifiMode(id));
	});
	return {"modes" : modes};
}

function modeName(mode) {
	for(var i in net_options) {
		if(net_options[i][1] == mode) {
			return net_options[i][0];
		}
	}
	return mode;
}

function addNetSection(ifname, mode)
{
	var n = uci.network;

	switch(mode) {
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
		n[net] = {"stype":"interface","ifname":ifname,"mtu":"1406","proto":"batadv","mesh":"bat0"};
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
		if(obj.ifname == ifname && obj.type != "bridge")
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
	for (var i=0; i<length; i++) {
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
	var id = "cfg"+(++gid);

	//add section to /etc/config/wireless
	switch(mode)
	{
	case "wan":
		//We need WDS for this interface to be bridged into br-wan. WDS is not standardized.
		//WDS is only easily configurable for 'mac80211' type devices (e.g. Atheros wireless chipsets).
		w[id] = {"device":device,"stype":"wifi-iface","mode":"sta","ssid":"OtherNetwork","key":"password_for_OtherNetwork","encryption":"psk2", "wds":"1", "network":"wan"};
		break;
	case "mesh":
		var net = ifname.replace(".", "_");
		w[id] = {"device":device,"stype":"wifi-iface","mode":"adhoc","ssid":s.default_ah_ssid,"bssid":s.default_ah_bssid,"hidden":1,"network":net};
		//connected via option network
		n[net] = {"stype":"interface","mtu":"1406","proto":"batadv","mesh":"bat0"};
		n.pchanged = true;
		break;
	case "freifunk":
		w[id] = {"device":device,"stype":"wifi-iface","mode":"ap","ssid":(s.community+".freifunk.net"),"network":"freifunk"};
		break;
	case "lan":
		w[id] = {"device":device,"stype":"wifi-iface","mode":"ap","ssid":"MyNetwork","key":randomString(10),"encryption":"psk2","network":"lan"};
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
		if(obj.device == dev && getWifiMode(id) == mode) {
			if(mode == "mesh") {
				delete n[obj.network];
				n.pchanged = true;
			}
			delete w[id];
			w.pchanged = true;
		}
	});
}

function rebuild_wifi()
{
	var root = $("wireless");
	removeChilds(root);

	//print wireless sections
	config_foreach(uci.wireless, "wifi-device", function(dev, obj) {
		var fs = append_section(root, "Wireless '"+dev+"'", dev);
		var info = collect_wifi_info(dev);

		for(var sid in obj)
			appendSetting(fs, ['wireless', dev, sid], obj[sid]);

		var lan_help = "<b>LAN</b>: Aktiviert ein privates, passwortgesch\xfctztes WLAN-Netz mit Zugang zum eigenen Internetanschluss.";
		var freifunk_help = "<b>Freifunk</b>: Der WLAN-Zugang zum Freifunk-Netz.";
		var mesh_help = "<b>Mesh</b>: Das WLAN-Netz \xfcber das die Router untereinander kommunizieren.";
		var wan_help = "<b>WAN</b>: Erm\xf6glicht den Internetzugang eines anderen, herk\xf6mmlichen Routers zu nutzen (nutzt WDS).";
		var mode_checks = append_check(fs, "Modus", dev+"_mode", info.modes, [["LAN","lan", lan_help], ["Freifunk","freifunk", freifunk_help], ["Mesh", "mesh", mesh_help], ["WAN", "wan", wan_help]]);
		var parent = append(fs, "div");

		//print wireless interfaces
		config_foreach(uci.wireless, "wifi-iface", function(wid, wobj) {
			if(wobj.device != dev) return;

			var mode = getWifiMode(wid);
			var title = (mode == "none") ? "'"+wobj.network+"'" : modeName(mode);
			var entry = append_section(parent, title, "wireless_"+dev+"_"+mode);

			for(var opt in wobj)
				appendSetting(entry, ["wireless", wid, opt], wobj[opt], mode);

			if(mode == "none")
			{
				append_button(entry, "L\xf6schen", function() {
					delWifiSection(dev, mode);
					rebuild_wifi();
				});
			}
		});

		/* add or remove a wifi interface */
		onDesc(mode_checks, "INPUT", function(e) {
			e.onclick = function(e) {
				var src = (e.target || e.srcElement);
				var mode = src.value;

				if(src.checked) {
					if(obj.type != "mac80211")
						alert("Diese Betriebsweise wird von diesem Chipsatz nicht unterst\xfctzt!");
					addWifiSection(dev, mode);
				} else {
					delWifiSection(dev, mode);
				}
				rebuild_wifi();
			};
		});
	});
}

function apply_port_action(switch_root)
{
	onDesc(switch_root, "INPUT", function(input) {
		var port = input.value;
		var dst = input;
		input.onclick = function(e) {
			var src = (e.target || e.srcElement);
			//uncheck all in same column
			onDesc(switch_root, "INPUT", function(e) {
				var src = (e.target || e.srcElement);
				if(e.value == port && e != dst) {
					e.checked = false;
					while(e != document) {
						if(e.onchange) {
							e.onchange();
							break;
						}
						e = e.parentNode;
					}
				}
			});
		};
	});
}

function build_vlan(switch_root, id, obj, swinfo, ifname, mode)
{
	var vlan_root = append(switch_root, 'div');
	vlan_root.id = id;

	for(var k in obj)
	{
		if(k == "ports")
			appendSetting(vlan_root, ["network", id, k], {"ifname": ifname, "ports":obj[k], "swinfo":swinfo}, mode);
		else
			appendSetting(vlan_root, ["network", id, k], obj[k], mode);
	}
}

function addVlanSection(device, vlan, ports)
{
	uci.network["cfg"+(++gid)] = { "stype" : "switch_vlan", "device" : device, "vlan" : ""+vlan, "ports" : ports };
}

function delVlanSection(device, vlan)
{
	var n = uci.network;
	config_foreach(n, "switch_vlan", function(id, obj) {
		if(obj.device == device && (vlan < 0 || obj.vlan == vlan))
			delete n[id];
	});
}

function renameIfname(old_if, new_if)
{
	config_foreach(uci.network, "*", function(id, obj) {
		if(!obj.ifname) return;
		var n = replaceItem(obj.ifname, old_if, new_if);
		if(n != obj.ifname) {
			obj.ifname = n;
			n.pchanged = true;
		}
	});
}

function collectVLANs(device)
{
	var vlans = [];
	config_foreach(uci.network, 'switch_vlan', function(id, obj) {
		if(obj.device == device) vlans.push(obj.vlan);
	});
	return vlans.sort();
}

function guess_vlan_ifname(swinfo, vlan, vlans) {

	if(vlans < 2) {
		return swinfo.ifname;
	} else if(swinfo.tagged_port) {
		return swinfo.ifname+"."+vlan;
	} else {
		return "eth"+(vlan -  swinfo.vlan_start);
	}
}

function collect_switch_info(device)
{
	var obj = {
		device : device,
		ifname : 'eth0', //base ifname for switch
		vlan_start : 1, //first vlan device is eth0.1
		tagged_port : uci.misc.data.tagged_port, //port number, no suffix
	};

	//if device is an interface name, then it is probably the base ifname
	var lan_ifname = uci.network_defaults.lan.ifname;
	if(inArray(device, split(lan_ifname)))
		obj.ifname = device;

	//model specific settings:
	//Portmap is a mapping of <label>/<internal port number>.
	//Underscore labels will not be displayed, but are included here,
	//because they are part of switch_vlan.ports in /etc/config/network.
	switch(uci.misc.data.model)
	{
		case 'tp-link-tl-wdr3600-v1':
		case 'tp-link-tl-wdr4300-v1':
			obj.port_map = [['_',0], ['WAN',1], ['1',2], ['2',3], ['3',4], ['4',5]];
			break;
		case 'tp-link-tl-wr1043n-nd-v1':
			obj.port_map = [['WAN',0], ['1',1], ['2',2], ['3',3], ['4',4],['_', 5]];
			break;
		case 'tp-link-tl-wr1043n-nd-v2':
			obj.port_map = [['WAN',5], ['1',4], ['2',3], ['3',2], ['4',1],['_', 0]];
			obj.ifname = "eth1";
			break;
		case 'tp-link-tl-wr741n-nd-v4':
		case 'tp-link-tl-wr841n-nd-v3':
		case 'tp-link-tl-wr841n-nd-v5':
		case 'tp-link-tl-wr841n-nd-v7':
			obj.port_map = [['_',0], ['1',2], ['2',3], ['3',4], ['4',1]];
			break;
		case 'tp-link-tl-wr841n-nd-v8':
			obj.ifname = "eth1";
			obj.port_map = [['_',0], ['1',1], ['2',2], ['3',3], ['4',4]];
			break;
		case 'tp-link-tl-wr841n-nd-v9':
		case 'tp-link-tl-mr3420-v1':
			obj.port_map = [['_',0], ['1',4], ['2',3], ['3',2], ['4',1]];
			break;
		case 'tp-link-cpe210-v1-0':
		case 'tp-link-cpe220-v1-0':
		case 'tp-link-cpe510-v1-0':
		case 'tp-link-cpe520-v1-0':
			obj.port_map = [['_',0], ['lan0',5], ['lan1',4]];
			break;
	}

	//create generic ports string
	if(!obj.ports)
	{
		//create a generic port map
		var all = "";
		config_foreach(uci.network_defaults, 'switch_vlan', function(id, obj) {
			if(obj.device != device) return;
			all += " "+obj.ports;
		});

		var ports_array = uniq(split(all.replace(/t/g, '')));
		ports_array.sort();
		obj.ports = ports_array.join(' ');
	}

	//create generic port mapping
	if(!obj.port_map)
	{
		var ps = split(obj.ports);
		obj.port_map = [];
		for(var i in ps)
		{
			var p = ps[i];
			if(p == obj.tagged_port)
				obj.port_map.push(['_',p]);
			else
				obj.port_map.push([p+"?",p]);
		}
	}

	return obj;
}

function append_vlan_buttons(parent, switch_root, switch_device)
{
	var buttons = append(parent, 'div');

	append_button(buttons, "Neu", function() {
		var swinfo = collect_switch_info(switch_device);
		var vlans = collectVLANs(switch_device);
		var tp = swinfo.tagged_port;
		var ports_none = tp ? tp+'t' : '';
		var ports_all = ports_none + " " + swinfo.ports.replace(new RegExp(tp), '');

		if(vlans.length >= swinfo.port_map.length)
			return alert("Mehr VLANs sind nicht m\xf6glich.");

		if(vlans.length <= 1) {
			var old_ifname = guess_vlan_ifname(swinfo, 1, 1);
			var new_ifname = guess_vlan_ifname(swinfo, 1, 2);

			renameIfname(old_ifname, new_ifname);
			delVlanSection(switch_device, -1);
			addVlanSection(switch_device, 1, ports_all);
		}

		var add_vlan = swinfo.vlan_start + vlans.length;
		var add_ifname = guess_vlan_ifname(swinfo, add_vlan, 2);

		delNetSection(add_ifname);
		addNetSection(add_ifname, "lan");
		addVlanSection(switch_device, add_vlan, ports_none);

		rebuild_switches();
		rebuild_assignment();
	});

	append_button(buttons, "L\xf6schen", function() {
		//delete the last vlan
		var swinfo = collect_switch_info(switch_device);
		var vlans = collectVLANs(switch_device);

		if(vlans.length <= 1)
			return alert("Mindestens ein VLAN muss erhalten bleiben.");

		//check if all ports of the last vlan are unchecked
		var all_unchecked = true;
		var vlan_root = $("network#"+switch_root.lastChild.id+"#ports");
		onDesc(vlan_root, "INPUT", function(e) {
			if(isNaN(e.value) || !e.checked) //ignore tagged and unchecked port
				return;
			all_unchecked = false;
			return false;
		});

		if(!all_unchecked)
			return alert("Die Ports des letzten VLANs m\xfcssen zuerst deselektiert werden.");

		//get last ifname of device
		var last_vlan = swinfo.vlan_start + vlans.length - 1;
		var old_ifname = guess_vlan_ifname(swinfo, last_vlan, vlans.length);
		delVlanSection(swinfo.device, last_vlan);
		delNetSection(old_ifname);

		if(vlans.length <= 2)
		{
			delVlanSection(swinfo.device, -1);

			var old_ifname = guess_vlan_ifname(swinfo, 1, 2);
			var new_ifname = guess_vlan_ifname(swinfo, 1, 1);
			renameIfname(old_ifname, new_ifname);

			//add a single switch_vlan for eth0
			addVlanSection(switch_device, swinfo.vlan_start, swinfo.ports);
		}

		rebuild_switches();
		rebuild_assignment();
	});
}

function rebuild_switches()
{
	var root = $("switches");
	removeChilds(root);

	//print switch sections
	config_foreach(uci.network, "switch", function(sid, sobj) {
		var swinfo = collect_switch_info(sobj.name);
		var vlans = collectVLANs(sobj.name);
		var sfs = append_section(root, "Switch '"+swinfo.ifname+"'", sid);
		var switch_root = append(sfs, 'div');
		var use_tagged = (collectVLANs(swinfo.device).length > 1);

		//print vlan sections
		config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
			if(vobj.device != swinfo.device) return;
			var ifname = guess_vlan_ifname(swinfo, vobj.vlan, vlans.length);
			var mode = getNetMode(ifname);
			if(mode != "none") {
				delNetSection(ifname);
				addNetSection(ifname, mode); //makes sure entry exists
			}
			build_vlan(switch_root, vid, vobj, swinfo, ifname, mode);
		});

		append_vlan_buttons(sfs, switch_root, swinfo.device);
		apply_port_action(switch_root);
	});
}

function save_data()
{
	for(var name in uci)
	{
		var obj = uci[name];
		if(!obj.pchanged)
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
