
/*
All required uci packages are stored variable uci.
The GUI code displayes and manipulated this variable.
*/
var uci = {};
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
	case "country":
		b = append_input(p, "Land", id, value);
		if(!adv_mode)
			b.lastChild.disabled = "disabled";
		break;
	case "channel":
		var channels = [1,2,3,4,5,6,7,8,9,10,11,12];
		if(value > 35) channels = [36,40,44,48,52,56,60,64,100,104,108,112,116,120,124,128,132,136,140];
		b = append_selection(p, "Kanal", id, value, channels);
		break;
	case "encryption":
		if(mode == "public" || mode == "mesh")
			return
		b = append_selection(p, "Verschl\xfcsselung", id, value, [["Keine", "none"],["WPA", "psk"], ["WPA2", "psk2"]]);
		break;
	case "key":
		b = append_input(p, "Passwort", id, value);
		addInputCheck(b.lastChild, /^[a-z0-9]{8,64}$/i, "Bitte ein Passwort aus mindestens acht Buchstaben und Nummern verwenden");
		break;
	case "hwmode":
		b = append_label(p, "Modus", "802."+value);
		break;
	case "ssid":
		b = append_input(p, "SSID", id, value);
		if(mode == "public" || mode == "mesh")
			if(!adv_mode)
				b.lastChild.disabled = "disabled";
		addInputCheck(b.lastChild, /^[^\x00-\x1F\x80-\x9F]{3,30}$/, "SSID ist ung\xfcltig.");
		break;
	case "share_internet":
		b = append_radio(p, "Gateway Modus", id, value, [["An", "yes"], ["Aus", "no"]]);
		if(!adv_mode)
			onDesc(b, "INPUT", function(e) { e.disabled = true; });
		break;
	case "config_nets":
		b = append_check(p, "SSH/HTTPS Freigeben", id, split(value), [["WAN","wan"], ["Private","private"], ["Public","public"]]);
		break;
	case "disabled":
		b = append_radio(p, "Deaktiviert", id, value, [["Ja", "1"], ["Nein", "0"]]);
		break;
	case "ports":
		var map = [];
		var tp = value.swinfo.tagged_port;
		var pm = value.swinfo.port_map;
		var v = (countVLANs(value.swinfo.device) > 1);
		for(var i in pm)
		{
			if(pm[i][0] == '_')
				map.push(['_', (v ? (tp+'t' ) : tp)]);
			else
				map.push(pm[i]);
		}
		b = append_check(p, value.title, id, split(value.ports), map);
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

	var fs = append_section(root, "Allgemeine Einstellungen");

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

	if(inArray(ifname, split(n.public.ifname)))
		return "public";

	if(inArray(ifname, split(n.private.ifname)))
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
	var ignore = ["dummy_public", "dummy_private", "dummy_mesh", "fastd_mesh", "bat0", "lo"];
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
		n[sid] = {"stype":"interface","ifname":ifname,"proto":"dhcp"};
		break;
	case "mesh":
		n[sid] = {"stype":"interface","ifname":ifname,"mtu":"1426","auto":"1","proto":"batadv","mesh":"bat0"};
		break;
	case "private":
		n[sid] = {"stype":"interface","ifname":ifname,"proto":"none","auto":"1"};
		n.private.ifname = addItem(n.private.ifname, ifname);
		break;
	case "public":
		n[sid] = {"stype":"interface","ifname":ifname,"proto":"none","auto":"1"};
		n.public.ifname = addItem(n.public.ifname, ifname);
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

	n.private.ifname = removeItem(n.private.ifname, ifname);
	n.public.ifname = removeItem(n.public.ifname, ifname);
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
	var ifname = device+"_"+mode;
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
		w[id] = {"device":device,"ifname":ifname,"stype":"wifi-iface","mode":"ap","ssid":f[i].default_ap_ssid,"network":"public"};
		break;
	case "private":
		w[id] = {"device":device,"ifname":ifname,"stype":"wifi-iface","mode":"ap","ssid":"MyNetwork","network":"private","key":randomString(16),"encryption":"psk2"};
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
				var ifname = dev+"_"+mode;

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
			appendSetting(vlan_root, ["network", id, k], {"title":ifname, "ports":obj[k], "swinfo":swinfo});
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

function renameIfname(old_if, new_if)
{
	var n = uci.network;
	for(var id in n)
		if(n[id].ifname)
			n[id].ifname = replaceItem(n[id].ifname, old_if, new_if);
	n.pchanged = true;
}

function countVLANs(device)
{
	var c = 0;
	var n = uci.network;
	for(var id in n)
	{
		if(n[id].stype == "switch_vlan" && n[id].device == device)
			c++;
	}
	return c;
}

function collect_switch_info(device)
{
	var obj = {
		device : device,
		ifname : 'eth0', //base interface
		vlan_start : 1, //first vlan device is eth0.1
		tagged_port : uci.misc.data.tagged_port, //port number, no suffix
	};

	//board specific settings
	switch(uci.misc.data.board)
	{
		case 'TL-WR1043ND':
			obj.port_map = [['WAN',0], ['1',1], ['2',2], ['3',3], ['4',4],['_', '5']];
			break;
		case 'TL-WR841N-v8':
			obj.ifname = 'eth1';
			break;
	}

	//create generic ports string
	if(!obj.ports)
	{
		//create a generic port map
		var all = "";
		config_foreach(uci.network, 'switch_vlan', function(id, obj) {
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
		var vlans = countVLANs(switch_device);

		if(vlans >= swinfo.port_map.length)
			return alert("Mehr VLANs sind nicht m\xf6glich.");

		var tp = swinfo.tagged_port;
		if(vlans <= 1)
		{
			//remove all switch_vlan sections
			delVlanSection(-1);

			//rename eth0 to eth0.1
			var v = swinfo.vlan_start;
			var i = swinfo.ifname;
			renameIfname(i, i+"."+v);

			//add a single switch_vlan for eth0.1
			var ports = swinfo.ports.replace(new RegExp(tp), tp+'t');
			addVlanSection(switch_device, v, ports);

			swinfo = collect_switch_info(switch_device);
		}

		var v = swinfo.vlan_start + vlans;
		var ifname = swinfo.ifname+"."+v;
		delNetSection(ifname);
		addNetSection(ifname, "private");
		addVlanSection(switch_device, v, tp+'t');

		rebuild_switches();
		rebuild_assignment();
	});

	append_button(buttons, "L\xf6schen", function() {
		//delete the last vlan
		var swinfo = collect_switch_info(switch_device);
		var vlans = countVLANs(switch_device);

		if(vlans <= 1)
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

		var v = swinfo.vlan_start + vlans - 1;
		var ifname = swinfo.ifname+"."+v;
		delVlanSection(v);
		delNetSection(ifname);

		if(vlans <= 2)
		{
			//remove all switch_vlan sections
			delVlanSection(-1);

			//rename eth0.1 to eth0
			var v = swinfo.vlan_start;
			var i = swinfo.ifname;
			renameIfname(i+"."+v, i);

			//add a single switch_vlan for eth0
			addVlanSection(switch_device, v, swinfo.ports);
		}

		rebuild_switches();
	});
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
		var use_tagged = (countVLANs(swinfo.device) > 1);

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

/*
Our scripts use "uci get network.wan.ifname" to get the WAN interface.
Therefore, this script makes sure the intended section is called 'wan',
The occurence of multiple WAN-sections is also checked.
*/
function select_wan()
{
	var n = uci.network;

	//rename section from 'wan'
	if('wan' in n)
	{
		n["cfg"+(++gid)] = n['wan'];
		delete n['wan'];
	}

	//make sure we only have at most one section for WAN
	var wan_id;
	for(var id in n)
	{
		var obj = n[id];
		if(obj.stype != 'interface' || !obj.ifname || obj.type == "bridge" || getMode(obj.ifname) != 'wan')
			continue;
		if(wan_id)
			return alert("Es kann nur ein Anschluss als Internetzugang (WAN) definiert werden. Bitte zuerst \xE4ndern.");
		if(id != 'wan')
			wan_id = id;
	}

	//rename section to 'wan'
	if(wan_id) {
		n['wan'] = n[wan_id];
		delete n[wan_id];
	}
}

function save_data()
{
	select_wan();
	for(var name in uci)
	{
		var obj = uci[name];
		if(!obj.pchanged)
			continue;
		var data = toUCI(obj);
		send("/cgi-bin/misc", { func : "set_config_file", name : name, data : data }, function(data) { setText('msg', data); reload(); });
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
