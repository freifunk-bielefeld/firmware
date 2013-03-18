
var uci = {};

function getNets()
{
  var nets = [];
  for(var id in uci.fastd) {
    var obj = uci.fastd[id];
    if(obj.stype == "fastd" || obj.stype == "group")
    	nets.push(id);
  }
  return nets;
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

function appendSetting(p, path, value)
{
  var id = path.join('#');
  var b;
  var name = path[path.length-1];

  switch(name)
  {
	case "name":
		b = append_input(p, "Name", id, value);
		break;
	case "net":
		var nets = getNets();
		b = append_selection(p, "Netz/Gruppe", id, value, nets);
		break;
	case "enabled":
		b = append_radio(p, "Aktiviert", id, value, [["Ja", "1"], ["Nein", '0']]);
		break;
	case "hostname":
		b = append_input(p, "Hostname", id, value);
		break;
	case "limit":
		b = append_selection(p, "Limit", id, value, [0,1,2,3,4,5,6,7,8,9]);
		break;
	case "address_family":
		if(!adv_mode) return;
		b = append_radio(p, name, id, value, [["IPv4", "ipv4"], ["IPv6", "ipv6"]]);
		break;
	case "port":
		b = append_input(p, "Port", id, value);
		addInputCheck(b.lastChild, /^[1-9]\d*$/, "Port muss eine Nummer sein.");
		break;
	case "float":
		b = append_radio(p, "Wechselnde IP", id, value, [["Ja", "1"], ["Nein", '0']]);
		break;
	case "key":
		if(!adv_mode) return;
		b = append_input(p, "Schl\xfcssel", id, value);
		break;
	case "syslog_level":
		if(!adv_mode) return;
		b = append_selection(p, name, id, value, ["error","warn","info","verbose","debug"]);
		break;
	case "interface":
		if(!adv_mode) return;
		b = append_label(p, name, value);
		break;
	case "mtu":
		b = append_label(p, "MTU", value);
		break;
	case "forward":
		if(!adv_mode) return;
		b = append_radio(p, "Forward", id, value, [["Ja", "1"], ["Nein", '0']]);
		break;
	case "method":
		if(!adv_mode) return;
		b = append_selection(p, "Zuordnung", id, value, ["none", "xsalsa20-poly1305", "aes128-gcm"]);
		break;
	default:
		return;
  }
 
	b.id = id; //needed for updateFrom
	b.onchange = function() {
		updateFrom(b);
		if(name == 'net')
			rebuildList();
	};
	
  return b;
}

function showPeer(id)
{
	var obj = uci.fastd[id];

	var root = get('entries');
	removeChilds(root);

	var fieldset = append_section(root, "Peer: '"+id+"'");
	for(var sid in obj)
		appendSetting(fieldset, ["fastd", id,  sid], obj[sid]);

	var div = append(fieldset, 'div');

	append_button(div, "Key Exportieren", function() {
		exportPeer(id, obj);
	});

	append_button(div, "L\xf6schen", function() {
		if(!confirm("Peer '"+id+"' wirklich l\xf6schen?")) return;
		delete uci.fastd[id];
		rebuildList();
	});
}

function showGroup(id)
{
	var obj = uci.fastd[id];
	var root = get('entries');
	removeChilds(root);

	var fieldset = append_section(root, "Gruppe: '"+id+"'");
	for(var sid in obj)
		appendSetting(fieldset, ["fastd", id, sid], obj[sid]);

	var div = append(fieldset, 'div');

	append_button(div, "L\xf6schen", function() {
		if(!confirm("Gruppe '"+id+"' wirklich l\xf6schen?")) return;
		var net = id;
		for(var id in uci.fastd)
		{
			if(uci.fastd[id].net == net)
				delete uci.fastd[id];
		}
		delete uci.fastd[net];
		rebuildList();
	});
}

function showNet(id)
{
	var obj = uci.fastd[id];
	var root = get('entries');
	removeChilds(root);

	var fieldset = append_section(root, "Netz: '"+id+"'");
	for(var sid in obj)
		appendSetting(fieldset, ["fastd", id, sid], obj[sid]);

	var div = append(fieldset, 'div');

	append_button(div, "Key Exportieren", function() {
		var port = /.*:([0-9]+)/.exec(obj.bind)[1];
		var hostname = uci.misc.data.hostname;
		var wan_ip = uci.misc.data.wan_ip;
		var peer = { stype : "peer", enabled : "1", net : "default", key : obj.key, port : port, float : '0' };
		if(wan_ip.length) peer.hostname = wan_ip;
		var w = {};
		w[hostname] = peer;
		exportFile(hostname, "package fastd\n"+toUCI(w));
	});
}

function exportAll()
{
	exportFile("fastd", "package fastd\n"+toUCI(uci.fastd));
}

function exportPeer(name, obj)
{
	var w = {};
	w[name] = obj;
	exportFile(name, "package fastd\n"+toUCI(w));
}

//get the file content from the "Open File" dialog
function importFile(file_handle)
{
	get('import_file').value = '';

	var reader = new FileReader();
	reader.onload = function(e) {
		var text = e.target.result;
		var objs = fromUCI(text).fastd;
		
		for(var id in objs)
		{
			if(id == 'pchanged')
				continue;

			if(id in uci.fastd)
			{
				alert("Ein Eintrag '"+id+"' existiert bereits.");
				continue;
			}

			switch(objs[id].stype)
			{
				case 'peer': case 'group': case 'fastd':
					uci.fastd[id] = objs[id];
			}
		}
		rebuildList();
    };
	reader.readAsText(file_handle);
}

//open the "Download File" dialog
function exportFile(file_name, file_data)
{
	//browsers don't support a filename (yet?)
	var a = get('export_file');
	a.href = "data:application/octet-stream;charset=utf-8," + escape(file_data);
	a.click();
	/*
	get("df_func").value = "send_back_as_file_download";
	get("df_name").value = file_name;
	get("df_data").value = file_data;
	get("df").submit();
	*/
}


function selectItem(id)
{
	onDesc(get("list"), 'LI', function(n) { 
		n.style.fontWeight = 'normal';
	});
	get(id).style.fontWeight = 'bold';
}

function rebuildList()
{
	var entries = get('entries');
	removeChilds(entries);

	var ul = get('list');
	removeChilds(ul);

	function append_peers(p, net)
	{
		var ul = append(p, 'ul');
		config_foreach(uci.fastd, "peer", function(id, obj) {
			if(obj.net != net) return;
			var li = create('li');
			var a = create('a');

			a.innerHTML = "Peer: '"+id+"'";
			a.onclick = function() { selectItem(id+"#li"); showPeer(id); };

			li.id = id+"#li";
			li.appendChild(a);
			ul.appendChild(li);
			if(obj.enabled == '0')
				li.style.backgroundColor = "#dbdbdb";
	   });
	}

	function append_groups(p, net)
	{
		var ul = append(p, 'ul');
		config_foreach(uci.fastd, "group", function(id, obj) {
			if(obj.net != net) return;
			var li = create('li');
			var a = create('a');

			a.innerHTML = "Gruppe: '"+id+"'";
			a.onclick = function() { selectItem(id+"#li"); showGroup(id); };

			li.id = id+"#li";
			li.appendChild(a);
			ul.appendChild(li);

			if(obj.enabled == '0')
				li.style.backgroundColor = "#dbdbdb";
			append_peers(li, id);
	   });
	}

	config_foreach(uci.fastd, "fastd", function(id, obj) {
		var li = append(ul, 'li');
		var a = append(li, 'a');

		a.innerHTML="Netz: '"+id+"'";
		a.onclick = function() { selectItem(id+"#li"); showNet(id); };

		li.id = id+"#li";
		if(obj.enabled == '0')
			li.style.backgroundColor = "#dbdbdb";
		append_groups(li, id);
		append_peers(li, id);
	});
}

function saveData()
{
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
	send("/cgi-bin/fastd", { func : "get_settings" }, function(data) {
		uci = fromUCI(data);
		rebuildList();
	});
}

reload()
