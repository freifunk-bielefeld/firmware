
/*
All required uci packages are stored variable uci.
The GUI code displayes and manipulated this variable.
*/
var uci = {};

var suffix_map = { "public" : "mesh", "private" : "lan", "mesh" : "bat", "wan" : "wan" };
var gid = 0;


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

function appendSetting(p, path, value, mode)
{
	var id = path.join('#');
	var b;
	var name = path[path.length-1];
	switch(name)
	{
	case "hostname":
		b = append_input(p, "Hostname", id, value);
		addInputCheck(b.lastChild, /^[\w]{3,30}$/, name + " ist ung\xfcltig.");
		break;
	case "channel":
		var channels = [1,2,3,4,5,6,7,8,9,10,11,12];
		if(value > 35) channels = [36,40,42,44,48,50,52,56,58,60,64,149,152,153,157,160,161,165];
		b = append_selection(p, "Kanal", id, value, channels);
		break;
	case "encryption":
		if(mode == "public" || mode == "mesh")
			return
		b = append_selection(p, "Verschl\xfcsselung", id, value, ["none", "psk", "psk2"]);
		break;
	case "key":
		b = append_input(p, "Passwort", id, value);
		addInputCheck(b.lastChild, /^[a-z0-9]{8,64}$/i, "Bitte ein Passwort aus mindestens acht Buchstaben und Nummern verwenden");
		break;
	case "hwmode": case "htmode": case "ht_capab":
		b = append_label(p, name, value);
		break;
	case "ssid":
		b = append_input(p, "SSID", id, value);
		if(mode == "public" || mode == "mesh")
			b.lastChild.disabled = "disabled";
		addInputCheck(b.lastChild, /^\w[\w\. ]{3,30}$/, "SSID ist ung\xfcltig.");
		break;
	case "share_internet":
		b = append_radio(p, "Internet Freigeben", id, value, [["Ja", "yes"], ["Nein", "no"]]);
		break;
	case "config_nets":
		b = append_check(p, "SSH/HTTPS Freigeben", id, split(value), [["WAN","wan"], ["Private","lan"], ["Public","mesh"]]);
		break;
	case "disabled":
		b = append_radio(p, "Deaktiviert", id, value, [["Ja", "1"], ["Nein", "0"]]);
		break;
	case "ports":
		b = append_check(p, value.title, id, split(value.ports), split(value.all_ports));
		//hide tagged port
		var tp = uci.misc.data.tagged_port;
		onDesc(b, "INPUT", function(e) {
			if(e.value == tp || e.value == tp+"t")
				hide(e.parentNode);
		});
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

function rebuild_general()
{
	var root = get("general");
	removeChilds(root);
	removeChilds(root);

	var fs = append_section(root, "Allgemeine Einstellungen:");

	var s = uci.system;
	var j = firstSectionID(s, "system");
	appendSetting(fs, ["system", j, "hostname"], s[j]["hostname"]);

	var f = uci.freifunk;
	var i = firstSectionID(f, "settings");
	for(var opt in f[i])
		appendSetting(fs, ['freifunk', i, opt], f[i][opt]);

	var div = append(fs, "div");
}

function getMode(ifname)
{
	var n = uci.network;

	if(inArray(ifname, split(n.mesh.ifname)))
		return "public";

	if(inArray(ifname, split(n.lan.ifname)))
		return "private";

	for(var id in n)
	{
		if(n[id].ifname != ifname) continue;
		if(n[id].proto == "batadv") return "mesh";
		if(n[id].proto == "dhcp") return "wan";
	}

	return "none";
}

function isWlanIF(ifname)
{
    var w = uci.wireless;
    for(var id in w)
        if(w[id].stype == "wifi-iface" && w[id].ifname == ifname)
            return true;
    return false;
}

function rebuild_assignment()
{
	var root = get("assignment");
	removeChilds(root);

	var fs = append_section(root, "Anschl\xfcsse");
	var net_options = [["Private", "private"], ["Public", "public"], ["Mesh", "mesh"], ["WAN", "wan"]];
	var ignore = ["dummy_mesh", "dummy_lan", "dummy_bat", "fastd_bat", "bat0", "lo"];
	var ifnames = [];

	//collect all interfaces
	config_foreach(uci.network, "interface", function(sid, sobj) {
		if(sobj.ifname) ifnames = ifnames.concat(split(sobj.ifname));
	});

	function getChangeAction(ifname)
	{
		return function(e) {
			var src = (e.target || e.srcElement);
			var mode = src.value;
			delNetSection(ifname);
			addNetSection(ifname, mode);
		};
	}

	ifnames = uniq(ifnames);
	ifnames.sort();
	for(var i in ifnames)
	{
		var ifname = ifnames[i];
		if(isWlanIF(ifname) || inArray(ifname, ignore))
			continue;
		var mode = getMode(ifname);
		var entry = append_selection(fs, ifname, "set_mode_"+ifname, mode, net_options);
		entry.onchange = getChangeAction(ifname);
	}
	var div = append(fs, "div");
}

function collect_wifi_info(device)
{
	var modes = [];
	config_foreach(uci.wireless, "wifi-iface", function(id, obj) {
		if(device == obj.device)
			modes.push(getMode(obj.ifname));
	});
	return {"modes" : modes};
}

function capitalise(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

function addNetSection(ifname, mode)
{
	var n = uci.network;
	var sid = "cfg"+(++gid);

	switch(mode)
	{
	case "wan":
		n['wan'] = {"stype":"interface","ifname":ifname,"proto":"dhcp"};
		break;
	case "mesh":
		n[sid] = {"stype":"interface","ifname":ifname,"mtu":"1528","auto":"1","proto":"batadv","mesh":"bat0"};
		break;
	case "private":
		n[sid] = {"stype":"interface","ifname":ifname,"proto":"none","auto":"1"};
		n.lan.ifname = addItem(n.lan.ifname, ifname);
		break;
	case "public":
		n[sid] = {"stype":"interface","ifname":ifname,"proto":"none","auto":"1"};
		n.mesh.ifname = addItem(n.mesh.ifname, ifname);
		break;
	case "none":
		n[sid] = {"stype":"interface","ifname":ifname,"proto":"none","auto":"1"};
	default:
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

	n.lan.ifname = removeItem(n.lan.ifname, ifname);
	n.mesh.ifname = removeItem(n.mesh.ifname, ifname);
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
	var f = uci.freifunk;
	var w = uci.wireless;
	var i = firstSectionID(f, "settings");
	var ifname = device+"_"+suffix_map[mode];
	var id = "cfg"+(++gid);

	switch(mode)
	{
	case "wan":
		w[id] = {"device":device,"ifname":ifname,"stype":"wifi-iface","mode":"sta","ssid":"OtherNetwork","key":"password_for_OtherNetwork","encryption":"psk2"};
		break;
	case "mesh":
		w[id] = {"device":device,"ifname":ifname,"stype":"wifi-iface","mode":"adhoc","ssid":f[i].default_ah_ssid,"bssid":f[i].default_ah_bssid,"hidden":1};
		break;
	case "public":
		w[id] = {"device":device,"ifname":ifname,"stype":"wifi-iface","mode":"ap","ssid":f[i].default_ap_ssid,"network":"mesh"};
		break;
	case "private":
		w[id] = {"device":device,"ifname":ifname,"stype":"wifi-iface","mode":"ap","ssid":"MyNetwork","network":"lan","key":randomString(16),"encryption":"psk2"};
		break;
	default:
		return alert("mode error '"+mode+"' "+device);
	}
	w.pchanged = true;
}

function delWifiSection(ifname)
{
	var w = uci.wireless;
	config_foreach(w, "wifi-iface", function(id, obj) {
		if(obj.ifname == ifname)
			delete w[id];
	});
	w.pchanged = true;
}

function rebuild_wifi()
{
	var root = get("wireless");
	removeChilds(root);

	//print wireless sections
	config_foreach(uci.wireless, "wifi-device", function(dev, obj) {
		var fs = append_section(root, "Wireless '"+dev+"'", dev);
		var info = collect_wifi_info(dev);

		for(var sid in obj)
			appendSetting(fs, ['wireless', dev, sid], obj[sid]);

		var mode_checks = append_check(fs, "Modus", dev+"_mode", info.modes, [["Private","private"], ["Public","public"], ["Mesh", "mesh"], ["WAN", "wan"]]);
		var parent = append(fs, "div");

		//print wireless interfaces
		config_foreach(uci.wireless, "wifi-iface", function(wid, wobj) {
			if(wobj.device != dev) return;

			var mode = getMode(wobj.ifname);
			var title = (mode == "none") ? "'"+wobj.ifname+"'" : capitalise(mode);
			var entry = append_section(parent, title, "wireless_"+dev+"_"+mode);

			for(var opt in wobj)
				appendSetting(entry, ["wireless", wid, opt], wobj[opt], mode);

			if(mode == "none")
			{
				append_button(entry, "L\xf6schen", function() {
					delWifiSection(ifname);
					rebuild_wifi();
				});
			}
		});

		onDesc(mode_checks, "INPUT", function(e) {
			e.onclick = function(e) {
				var src = (e.target || e.srcElement);
				var mode = src.value;
				var ifname = dev+"_"+suffix_map[mode];

				if(src.checked) {
					delNetSection(ifname);
					addNetSection(ifname, mode);
					addWifiSection(dev, mode);
				} else {
					delNetSection(ifname);
					delWifiSection(ifname);
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
			//ignore unchecking
			if(!src.checked)
				return (src.checked = true);

			//uncheck all in same column
			onDesc(switch_root, "INPUT", function(e) {
				var src = (e.target || e.srcElement);
				if(e.value == port && e != dst)
					e.checked = false;
			});

			updateFrom(switch_root);
		};
	});
}

function build_vlan(switch_root, id, obj, swinfo, ifname)
{
	var vlan_root = append(switch_root, 'div');
	vlan_root.id = id;

	for(var k in obj)
	{
		if(k == "ports")
			appendSetting(vlan_root, ["network", id, k], {"title": ifname, "ports":obj[k], "all_ports":swinfo.ports, "tagged_port":swinfo.tagged_port});
		else
			appendSetting(vlan_root, ["network", id, k], obj[k]);
	}
}

function addVlanSection(device, vlan, ports)
{
	uci.network["cfg"+(++gid)] = { "stype" : "switch_vlan", "device" : device, "vlan" : ""+vlan, "ports" : ports };
}

function delVlanSection(vlan)
{
	var n = uci.network;
	config_foreach(n, "switch_vlan", function(id, obj) {
		if(vlan < 0 || obj.vlan == vlan)
			delete n[id];
	});
}

function append_vlan_buttons(parent, switch_root, switch_device)
{
	var buttons = append(parent, 'div');

	append_button(buttons, "Neu", function() {
		var swinfo = collect_switch_info(switch_device);
		var new_vlan = switch_root.childNodes.length + 1;

		if(new_vlan >= split(swinfo.ports).length)
			return alert("Mehr VLANs sind nicht m\xf6glich.");

		if(new_vlan == 2)
		{
			enableSwitchTagging(swinfo);
			swinfo = collect_switch_info(switch_device);
		}

		var ifname = (new_vlan > 1) ? (swinfo.ifname+"."+new_vlan) : swinfo.ifname;
		delNetSection(ifname);
		addNetSection(ifname, "private");
		addVlanSection(swinfo.device, new_vlan, uci.misc.data.tagged_port+"t");
		rebuild_switches();
		rebuild_assignment();
	});

	append_button(buttons, "L\xf6schen", function() {
		var swinfo = collect_switch_info(switch_device);
		var del_vlan = switch_root.childNodes.length;
		var ifname = (del_vlan > 1) ? (swinfo.ifname+"."+del_vlan) : swinfo.ifname;

		if(del_vlan <= 1)
			return alert("Mindestens ein VLAN muss erhalten bleiben.");

		//check if all ports of the last vlan are unchecked
		var all_unchecked = true;
		var vlan_root = get("network#"+switch_root.lastChild.id+"#ports");
		onDesc(vlan_root, "INPUT", function(e) {
			if(isNaN(e.value) || !e.checked) //ignore tagged and unchecked port
				return;
			all_unchecked = false;
			return false;
		});

		if(!all_unchecked)
			return alert("Die Ports des letzten VLANs m\xfcssen zuerst deselektiert werden.");

		delVlanSection(del_vlan);
		delNetSection(ifname);
		if(del_vlan == 2)
			disableSwitchTagging(swinfo);

		rebuild_switches();
	});
}

function collect_switch_info(device)
{
	var obj = {device : device, ifname : "eth0", ports : ""};
	switch(uci.misc.data.board)
	{
		case "TL-WR841N-v8":
			obj.ifname = "eth1";
			break;
	}

	var str = "";
	config_foreach(uci.network, "switch_vlan", function(id, obj) {
		if(obj.device != device) return;
		str += " "+obj.ports;
	});

	str = uniq(split(str));
	str.sort();
	obj.ports = str.join(' ');

	return obj;
}

function enableSwitchTagging(swinfo)
{
	//rename eth0 to eth0.1
	var n = uci.network;
	for(var id in n)
		if(n[id].ifname)
			n[id].ifname = replaceItem(n[id].ifname, swinfo.ifname, swinfo.ifname+".1");

	//make ports tagged
	var tp = uci.misc.data.tagged_port;
	var ports = addItem(removeItem(swinfo.ports, tp), tp+"t");

	//remove all switch_vlan sections
	delVlanSection(-1);
	//add a single switch_vlan for eth0.1
	addVlanSection(swinfo.device, 1, ports);

	n.pchanged = true;
}

function disableSwitchTagging(swinfo)
{
	//rename eth0.1 to eth0
	var n = uci.network;
	for(var id in n)
		if(n[id].ifname)
			n[id].ifname = replaceItem(n[id].ifname, swinfo.ifname+".1", swinfo.ifname);

	//make ports untagged
	var tp = uci.misc.data.tagged_port;
	var ports = addItem(removeItem(swinfo.ports, tp+"t"), tp);

	//remove all switch_vlan sections
	delVlanSection(-1);
	//add a single switch_vlan for eth0
	addVlanSection(swinfo.device, 1, ports);

	n.pchanged = true;
}

function rebuild_switches()
{
	var root = get("switches");
	removeChilds(root);

	//print switch sections
	config_foreach(uci.network, "switch", function(sid, sobj) {
		var swinfo = collect_switch_info(sobj.name);
		var sfs = append_section(root, "Switch '"+swinfo.ifname+"'", sid);
		var switch_root = append(sfs, 'div');
		var use_tagged = (swinfo.ports.indexOf('t') != -1);

		//print vlan sections
		config_foreach(uci.network, "switch_vlan", function(vid, vobj) {
			if(vobj.device != swinfo.device) return;
			var ifname = use_tagged ? (swinfo.ifname+"."+vobj.vlan) : swinfo.ifname;
			var mode = getMode(ifname);
			delNetSection(ifname);
			addNetSection(ifname, mode); //makes sure entry exists
			build_vlan(switch_root, vid, vobj, swinfo, ifname);
		});

		append_vlan_buttons(sfs, switch_root, swinfo.device);
		apply_port_action(switch_root);
	});
	rebuild_assignment();
}

function save_data()
{
	for(var name in uci)
	{
		var obj = uci[name];
		if(!obj.pchanged)
			continue;
		var data = toUCI(obj);
		send("/cgi-bin/settings", { func : "set_file", name : name, data : data }, function(data) { setText('msg', data); reload(); });
	}
}

function reload()
{
	send("/cgi-bin/settings", { func : "get_settings" }, function(data) {
		uci = fromUCI(data);
		rebuild_general();
		rebuild_assignment();
		rebuild_wifi();
		rebuild_switches();
	});
}

reload();
