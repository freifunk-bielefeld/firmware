

var wifi_options = [["Mesh", "mesh"], ["Public", "public"], ["Private", "private"]];
var net_options = [["Mesh", "mesh"], ["Public", "public"], ["Private", "private"], ["WAN", "wan"]];

var all = {}; //all uci settings we have got
var wan_ifs = [];
var private_ifs = [];
var public_ifs = [];
var mesh_ifs = [];


function appendSetting(p, prefix, name, value, mode)
{
  if(inArray(name, ["ifname", "up", "type", "macaddr"]))
    return;

  switch(name)
  {
    case "channel":
      append_selection(p, "Kanal", prefix+"#"+name, value, [1,2,3,4,5,6,7,8,9,10,11,12]);
      break;
    case "encryption":
      append_selection(p, "Verschl\xFCsselung", prefix+"#"+name, value, ["none", "psk2"]);
      break;
    case  "key":
      append_input(p, "Passwort", prefix+"#"+name, value);
      break;
    case "hwmode": case "htmode": case "ht_capab":
      //display, read only, no send back to router
      append_label(p, name, value);
      break;
    case "ssid":
      if(mode == "private")
        append_input(p, "SSID", prefix+"#ssid", value);
      else //display, send back to router
        append_input(p, "SSID", prefix+"#ssid", value).disabled="disabled";
      break;
    case "share_internet":
        append_radio(p, "Internet Freigeben", prefix+"#share_internet", value, [["Ja", "yes"], ["Nein", "no"]]);
        break;
    case "config_nets":
        append_check(p, "SSH/HTTPS Freigeben", prefix+"#config_nets", split(value), [["WAN","wan"], ["Private","lan"], ["Public","mesh"]]);
        break;
    default:
      //no display, send back to router
      hide(append_input(p, name, prefix+"#"+name, value));
  }
}

function append_save_button(parent, _root, func)
{
  var div = append(parent, "div");
  var root = _root;
  append_button(div, "Speichern", function()
  {
    var obj = { func : func };
    collect_inputs(root, obj);
    alert(obj.toSource());
    send("/cgi-bin/settings", obj, function(data) { setText('msg', data); });
  });
}

function getMode(ifname)
{
  if(inArray(ifname, wan_ifs)) return "wan";
  else if(inArray(ifname, private_ifs)) return "private";
  else if(inArray(ifname, public_ifs)) return "public";
  else if(inArray(ifname, mesh_ifs)) return "mesh";
  else return "none";
}

//e.g. get ethX when there is ethX.Y
function getSwitchBase(ifnames)
{
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
  
  var ifnames = split(all.ifconfig.all.interfaces);
  var switch_ifname = getSwitchBase(ifnames);
  var fs = append_section(root, "Verwendung");
  
  ifnames.sort();
  for(var i in ifnames)
  {
      var ifname = ifnames[i];
      //some interfaces need to be ignored
      if(inArray(ifname, ["lo", "br-mesh", "br-lan", switch_ifname]))
        continue;
      
      var mode = getMode(ifname);
      var options = isWLAN(ifname) ? wifi_options : net_options;
      var radio = append_radio(fs, ifname, "set_mode##"+ifname, mode, options);
      
      if(inArray(ifname, ["dummy_mesh", "dummy_lan", "dummy_bat", "bat0"]))
        hide(radio);
  }
  
  append_save_button(fs, fs, "set_assignment");
}

//print freifunk config
function show_general()
{
  var root = get("general");
  removeChilds(root);
  
  var fs = append_section(root, "Allgemeine Einstellungen:");

    for(var sid in all.freifunk)
    {
        var fobj = all.freifunk[sid];
        for(var opt in fobj)
            appendSetting(fs, "freifunk#"+sid, opt, fobj[opt], "");
    }
  append_save_button(fs, fs, "set_freifunk");
}


function getDefaults(dev, mode)
{
  var ff = all.freifunk["settings"];
  if(mode == "mesh")
    return {"device":dev,"mode":"adhoc","ssid":ff.default_ah_ssid,"bssid":ff.default_ah_bssid,"hidden":1};
  if(mode == "public")
    return {"device":dev,"mode":"ap","ssid":ff.default_ap_ssid,"network":"mesh"};
  if(mode == "private")
    return {"device":dev,"mode":"ap","ssid":"MyNetwork","network":"lan","key":"","encryption":"none"};
  return {};
}

function show_wifi()
{
  var root = get("wireless");
  removeChilds(root);
  
  //print wireless sections
  config_foreach(all.wireless, "wifi-device", function(id, obj)
  {
    var fs = append_section(root, "Wireless '"+id+"'", id);
     
    for(var sid in obj)
      appendSetting(fs, "wireless#"+id, sid, obj[sid], "_");
  
    var modes = [];
    config_foreach(all.wireless, "wifi-iface", function(wid, wobj)
    {
      if(id == wobj.device)
        modes.push(getMode(wobj.ifname));
    });
    
    var checks = append_check(fs, "Modus", id+"_modes", modes, wifi_options);
    var entries = append(fs, "div");

    function addEntry(mode, dev, wid, wobj)
    {
      wobj = wobj ? wobj : getDefaults(dev, mode);
       
      var ifname = ("ifname" in wobj) ? wobj.ifname : "???";
      var sfs = append_section(entries, mode+": '"+ifname+"'", dev+"#"+mode);
      sfs.wid = wid;
        
      for(var okey in wobj)
        appendSetting(sfs, "wireless#"+wid, okey, wobj[okey], mode);
    }

    //print wireless interfaces
    config_foreach(all.wireless, "wifi-iface", function(wid, wobj)
    {
      var mode = getMode(wobj["ifname"]);
      addEntry(mode, id, wid, wobj);
    });
    
    onDesc(checks, "INPUT", function(e) {
      e.onclick = function(e) {
      var src = (e.target || e.srcElement);
      var mode = src.value;
      var item = get(id+"#"+mode);
        
    if(src.checked)
    {
        //send("/cgi-bin/settings", {func : "create_section", pkg : "wireless", stype : "wifi-iface"}, function(sec_id) {
            addEntry(mode, id, sec_id, null);
        //});
    }
    else if(confirm(mode+" l\xF6schen?"))
    {
        //send("/cgi-bin/settings", { func : "delete_section", pkg : "wireless", sec : item.wid}, function(data) {
            entries.removeChild(item);
        //});
    }
      else
        src.checked = true;
      }
    });
    append_save_button(fs, fs, "set_wireless");
  });
}

function apply_port_action(entries, checks)
{
    onDesc(checks, "INPUT", function(e) {
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
    var ifname = info.tagged_port.length ? (info.switch_ifname+"."+vobj.vlan) : ("eth"+vobj.vlan);
   var entry = append(entries, 'div');
    
    var checks = append_check(entry, ifname+" ports", "network#"+vid+"#ports", split(vobj.ports), info.all_ports);
    for(var okey in vobj)
        if(okey != "ports")
            appendSetting(entry, "network#"+vid, okey, vobj[okey], "");
    
  //hide tagged port from de-selection
  if(info.tagged_port.length)
    hide(checks.lastChild);
    
    apply_port_action(entries, checks); //get("network#"+vid+"#ports");
}

function append_vlan_buttons(parent, entries, info)
{
    var buttons = append(parent, 'div');
    
    append_button(buttons, "Neu", function() {
        var vlan = entries.childNodes.length + 1;
        if(vlan <= (info.all_ports.length - (info.tagged_port.length ? 1 : 0)))
        {
            var defaults = { vlan : vlan, device : info.switch_device, ports : info.tagged_port, stype : "switch_vlan"};
            addVLAN(entries, "new_"+vlan, defaults, info);
        };
    });
    
    append_button(buttons, "Loeschen", function() {
        if(entries.childNodes.length > 1)
            entries.removeChild(entries.lastChild);
    });
    
    append_button(buttons, "Speichern", function() {
      var obj = { func : "set_network" };
      collect_inputs(parent, obj);
      for(var key in obj)
        if(obj[key] == info.tagged_port)
        {
          setText('msg', "Please select at least one port for every VLAN.");
          return false;
        }
        alert(obj.toSource());
        send("/cgi-bin/settings", obj, function(data) { setText('msg', data); });
    });
}

function collect_switch_info(sobj)
{
    var all_vids = [];
    var all_ports = [];
    var tagged_port = "";
    var device = sobj.name;
    
    config_foreach(all.network, "switch_vlan", function(vid, vobj)
    {
      if(vobj["device"] != device)
        return;
    
        var ports = split(vobj.ports);
        for(var i in ports)
        {
            var port = ports[i];
            if(port[port.length-1] == 't')
                tagged_port = port;
            else
                all_ports.push(port);
        }
        all_vids.push(vid);
    });
    
    all_ports.sort();
    if(tagged_port.length)
        all_ports.push(tagged_port);
    
    var ifnames = split(all.ifconfig.all.interfaces);
    var base = getSwitchBase(ifnames);
    
    return {all_vids : all_vids, all_ports : all_ports, tagged_port : tagged_port, switch_device : device, switch_ifname : base};
}

function show_switches()
{
  var root = get("switches");
  removeChilds(root);
  
  //print switch sections
  config_foreach(all.network, "switch", function(sid, sobj)
  {
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
    
    wan_ifs = split(all.network.wan.ifname);
    private_ifs = split(all.network.lan.device);
    public_ifs = split(all.network.mesh.device);
    mesh_ifs = split(all["batman-adv"].bat0.interfaces);
    
    show_general();
    show_assignment();
    show_wifi();
    show_switches();
  });
}

reload();
