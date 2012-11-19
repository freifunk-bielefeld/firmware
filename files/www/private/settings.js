
var wifi_options = [["Mesh", "mesh"], ["Public", "public"], ["Private", "private"]];
var net_options = [["Mesh", "mesh"], ["Public", "public"], ["Private", "private"], ["WAN", "wan"]];

var all = {}; //all uci settings we have got
var guid = 0;


function appendSetting(p, prefix, name, value, value2)
{
  if(inArray(name, ["ifname", "up", "type", "macaddr"]))
    return;
  var id = prefix+"#"+name;
  var e;
  switch(name)
  {
    case "channel":
      e = append_selection(p, "Kanal", id, value, [1,2,3,4,5,6,7,8,9,10,11,12]);
      break;
    case "encryption":
      e = append_selection(p, "Verschl\xFCsselung", id, value, ["none", "psk2"]);
      break;
    case  "key":
      e = append_input(p, "Passwort", id, value);
      break;
    case "hwmode": case "htmode": case "ht_capab":
      //display, read only, no send back to router
      e = append_label(p, name, value);
      break;
    case "ssid":
        e = append_input(p, "SSID", id, value);
        e.lastChild.disabled = (value2 == "private") ? "" : "disabled";
      break;
    case "share_internet":
        e = append_radio(p, "Internet Freigeben", id, value, [["Ja", "yes"], ["Nein", "no"]]);
        break;
    case "config_nets":
        e = append_check(p, "SSH/HTTPS Freigeben", id, split(value), [["WAN","wan"], ["Private","lan"], ["Public","mesh"]]);
        break;
    case "ports":
        e = append_check(p, value2.ifname+" ports", id, split(value), value2.all_ports);
        if(value2.tagged_port.length)
            hide(e.lastChild); //hide tagged port from de-selection
        break;
    default:
      //no display, send back to router
      e = append_input(p, name, id, value);
      hide(e);
  }
    e.id = id;
}

function append_save_button(parent, _root, func)
{
  var root = _root;
  append_button(parent, "Speichern", function() {
    var obj = { func : func };
    collect_inputs(root, obj);
    send("/cgi-bin/settings", obj, function(data) { setText('msg', data); });
  });
}

function getMode(ifname)
{
  var mesh_ifs = split(all["batman-adv"].bat0.interfaces);
  if(inArray(ifname, mesh_ifs)) return "mesh";

  var public_ifs = split(all.network.mesh.device);
  if(inArray(ifname, public_ifs)) return "public";

  var private_ifs = split(all.network.lan.device);
  if(inArray(ifname, private_ifs)) return "private";

  var wan_ifs = split(all.network.wan.ifname);
  if(inArray(ifname, wan_ifs)) return "wan";

  return "none";
}

//e.g. get ethX when there is ethX.Y
function getSwitchDevice()
{
  var ifnames = split(all.ifconfig.all.interfaces);
  for(var i in ifnames)
  {
    var n = ifnames[i];
    var p = n.indexOf('.');
    if(p != -1)
      return n.substring(0,p);
  }
  return "";
}

function isWLAN(ifname) {
  return /^(wlan|ath|wl)\d[\-\d]*$/.test(ifname);
}

function show_assignment()
{
  var root = get("assignment");
  removeChilds(root);

  var fs = append_section(root, "Verwendung");
  var ifnames = split(all.ifconfig.all.interfaces);
  var ignore = ["lo", "br-mesh", "br-lan"];

  //predict switch interfaces
  config_foreach(all.network, "switch", function(sid, sobj) {
    var info = collect_switch_info(sobj);
    if(info.switch_ifname.length)
      ignore.push(info.switch_ifname);
    config_foreach(all.network, "switch_vlan", function(vid, vobj) {
      var ifname = info.tagged_port.length ? (info.switch_ifname+"."+vobj.vlan) : ("eth"+vobj.vlan);
      ifnames.push(ifname);
    });
  });

  //predict tinc/n2n interfaces
  config_foreach(all.tinc, "tinc-net", function(id, obj) { ifnames.push(id); });
  config_foreach(all.n2n, "edge", function(id, obj) { ifnames.push(id); });

  ifnames = uniq(ifnames);
  ifnames.sort();
  for(var i in ifnames)
  {
    var ifname = ifnames[i];
    //some interfaces need to be ignored
    if(inArray(ifname, ignore))
      continue;

    var mode = getMode(ifname);
    var options = isWLAN(ifname) ? wifi_options : net_options;
    var radio = append_radio(fs, ifname, "set_mode##"+ifname, mode, options);

    if(inArray(ifname, ["dummy_mesh", "dummy_lan", "dummy_bat", "bat0"]))
      hide(radio);
  }
  
  var div = append(fs, "div");
  append_save_button(div, fs, "set_assignment");
}

//print freifunk config
function show_general()
{
  var root = get("general");
  removeChilds(root);

  var fs = append_section(root, "Allgemeine Einstellungen:");

  for(var id in all.freifunk) break;
  var ff = all.freifunk[id];

  for(var opt in ff)
    appendSetting(fs, "freifunk#"+id, opt, ff[opt], "");

  var div = append(fs, "div");
  append_save_button(div, fs, "set_freifunk");
}

function getWifiDefaults(dev, mode)
{
  for(var id in all.freifunk) break;
  var ff = all.freifunk[id];

  if(mode == "mesh")
    return {"device":dev,"stype":"wifi-iface","mode":"adhoc","ssid":ff.default_ah_ssid,"bssid":ff.default_ah_bssid,"hidden":1};
  if(mode == "public")
    return {"device":dev,"stype":"wifi-iface","mode":"ap","ssid":ff.default_ap_ssid,"network":"mesh"};
  if(mode == "private")
    return {"device":dev,"stype":"wifi-iface","mode":"ap","ssid":"MyNetwork","network":"lan","key":"","encryption":"none"};
  alert("internal error");
}

function collect_wifi_info(device)
{
  var modes = [];
  config_foreach(all.wireless, "wifi-iface", function(wid, wobj) {
    if(device == wobj.device)
      modes.push(getMode(wobj.ifname));
  });
  return {"modes" : modes};
}

function addWifi(mode, wid, dev, wobj)
{
  wobj = wobj ? wobj : getWifiDefaults(dev, mode);

  var parent = get("wireless_"+dev+"_wifis");
  var ifname = ("ifname" in wobj) ? wobj.ifname : "???";
  var sfs = append_section(parent, mode+": '"+ifname+"'", "wireless_"+dev+"_"+mode);

  for(var okey in wobj)
    appendSetting(sfs, "wireless#"+wid, okey, wobj[okey], mode);

  append_button(sfs, "L\xF6schen", function() {
    parent.removeChild(sfs);
  });
}

function append_wifi_buttons(fs, dev)
{
  append_save_button(fs, fs, "set_wireless");

  append_button(fs, "Mesh", function() {
    if(get("wireless_"+dev+"_public"))
      return alert("Es gibt bereits ein Mesh Wifi Interface f\xFCr '"+dev+"'.");
    addWifi("mesh", ++guid, dev, null);
  });

  append_button(fs, "Public", function() {
    if(get("wireless_"+dev+"_public"))
      return alert("Es gibt bereits ein Public Wifi Interface f\xFCr '"+dev+"'.");
    addWifi("public", ++guid, dev, null);
  });

  append_button(fs, "Private", function() {
    if(get("wireless_"+dev+"_private"))
      return alert("Es gibt bereits ein Private Wifi Interface f\xFCr '"+dev+"'.");
    addWifi("private", ++guid, dev, null);
  });
}

function show_wifi()
{
  var root = get("wireless");
  removeChilds(root);
  
  //print wireless sections
  config_foreach(all.wireless, "wifi-device", function(id, obj) {
  var fs = append_section(root, "Wireless '"+id+"'", id);

  for(var sid in obj)
    appendSetting(fs, "wireless#"+id, sid, obj[sid], "_");

  var info = collect_wifi_info(id);
  var entries = append(fs, "div");
  entries.id = "wireless_"+id+"_wifis";

  //print wireless interfaces
  config_foreach(all.wireless, "wifi-iface", function(wid, wobj) {
    var mode = getMode(wobj["ifname"]);
    addWifi(mode, wid, id, wobj);
  });

  append_wifi_buttons(fs, id);
  });
}

function apply_port_action(entries, checks)
{
  onDesc(checks, "INPUT", function(e){
    var port = e.value;
    var dst = e;
    e.onclick = function(e) {
      var src = (e.target || e.srcElement); 
      if(!src.checked)
        return (src.checked = true);

      onDesc(entries, "INPUT", function(e) {
      var src = (e.target || e.srcElement);
      if(e.value == port && e != dst)
        e.checked = false;
      });
    };
  });
}

function addVLAN(entries, vid, vobj, info)
{
  info["ifname"] = info.tagged_port.length ? (info.switch_ifname+"."+vobj.vlan) : ("eth"+vobj.vlan);
  var entry = append(entries, 'div');
  entry.id = vid;

  for(var okey in vobj)
    appendSetting(entry, "network#"+vid, okey, vobj[okey], info);

  var checks = get("network#"+vid+"#ports");
  apply_port_action(entries, checks);
}

function append_vlan_buttons(parent, entries, info)
{
  var buttons = append(parent, 'div');

  append_button(buttons, "Speichern", function() {
    var obj = { func : "set_network" };
    collect_inputs(parent, obj);
    for(var key in obj)
      if(obj[key] == info.tagged_port)
        return alert("Jedem VLAN mu\xDF mindestens ein Port zugeordnet werden.");

    send("/cgi-bin/settings", obj, function(data) { setText('msg', data); });
  });

  append_button(buttons, "Neu", function() {
    var vlan = entries.childNodes.length + 1;
    if(vlan <= (info.all_ports.length - (info.tagged_port.length ? 1 : 0)))
    {
      var defaults = { vlan : vlan, device : info.switch_device, ports : info.tagged_port, stype : "switch_vlan"};
      addVLAN(entries, ++guid, defaults, info);
    };
  });

  append_button(buttons, "L\xF6schen", function() {
    if(entries.childNodes.length < 2)
      return alert("Mindestens ein VLAN wird ben\xF6tigt.");

    var id = entries.lastChild.id;
    var all_unchecked = true;
    var checks = get("network#"+id+"#ports");
    onDesc(checks, "INPUT", function(e) {
      if(isNaN(e.value) || !e.checked) //ignore tagged and unchecked port
        return;
      all_unchecked = false;
      return false;
    });

    if(all_unchecked)
      entries.removeChild(entries.lastChild);
    else
      alert("Vor dem L\xF6schen eines VLANs m\xFCssen alle Ports entfernt werden.");
  });
}

function collect_switch_info(sobj)
{
  var all_vids = [];
  var all_ports = [];
  var tagged_port = "";
  var device = sobj.name;

  config_foreach(all.network, "switch_vlan", function(vid, vobj) {
    if(vobj["device"] != device)
      return;

    var ports = split(vobj.ports);
    for(var i in ports)
    {
      var port = ports[i];
      if(isNaN(port))
        tagged_port = port;
      else
        all_ports.push(port);
    }
    all_vids.push(vid);
  });

  all_ports.sort();
  if(tagged_port.length)
    all_ports.push(tagged_port);

  var sdev = getSwitchDevice();
  return {all_vids : all_vids, all_ports : all_ports, tagged_port : tagged_port, switch_device : device, switch_ifname : sdev};
}

function show_switches()
{
  var root = get("switches");
  removeChilds(root);

  //print switch sections
  config_foreach(all.network, "switch", function(sid, sobj) {
    var info = collect_switch_info(sobj);
    var sfs = append_section(root, "Switch '"+info.switch_ifname+"'", sid);
    var entries = append(sfs, 'div');

    //print vlan sections
    for(var i in info.all_vids)
    {
      var vid = info.all_vids[i];
      var vobj = all.network[vid];
      addVLAN(entries, vid, vobj, info);
    }

    append_vlan_buttons(sfs, entries, info);
  });
}

function reload()
{
  send("/cgi-bin/settings", { func : "get_settings" }, function(data) {
  all = parseUCI(data);

  show_general();
  show_assignment();
  show_wifi();
  show_switches();
  });
}

reload();
