
var hosts = [];
var nets = [];
var changes = {};

var net_buttons =
['<button type="button" onclick="net_delete_entry(\'uf2\')">L&ouml;schen</button>',
'<button type="button" onclick="net_save_entry(\'uf2\')">Speichern</button>',
'<button type="button" onclick="net_export_public_key(\'uf2\')">Export Public Key</button>',
'<button type="button" onclick="net_export_private_key(\'uf2\')" class="advanced">Export Private Key</button>',
'<form id="uf2" action="/cgi-bin/tinc" enctype="multipart/form-data" method="post">',
'    <div style="position: relative">',
'        <input type="file" name="key_file" class="file" onchange="get(\'uf2_fake_input\').value = this.value" onmouseout="get(\'uf2_fake_input\').value = this.value">',
'        <div class="fakefile">',
'            <input  type="text" name="_" value="" style="width: 10em;" id="uf2_fake_input" />',
'            <button type="button" onclick="add_host_by_key()">Add Host by Public Key</button>',
'        </div>',
'    </div>',
'    <input type="hidden" name="func" value="net_add_host_by_public_key">',
'    <input type="hidden" name="net_name" value="" id="uf2_net_name">',
'</form>'].join("\n");

var host_buttons =
['<button type="button" onclick="delete_host(\'uf2\')">L&ouml;schen</button>',
'<button type="button" onclick="export_host_key(\'uf2\')">Export Public Key</button>'].join("\n");


function mysend(obj)
{
	send("/cgi-bin/tinc", obj, function(data) {
		setText("msg", data);
	});
}

function adv_mode()
{
	var e = get("adv_mode");
	var es = document.getElementsByClassName("advanced");
	for(var i in es) e.checked ? show(es[i]) : hide(es[i]);
}

function select(name)
{
	setText("msg", "");

	var li = get(name+"#li");
	var div = get(name+"#div");

	var entries = get("entries");
	//show(entries.parentNode);

	onDesc(get("list"), 'A', function(n) { removeClass(n, "selected"); });
	if(li) addClass(li.firstChild, "selected");

	onChilds(entries, 'DIV', function(n) { hide(n); });
	if(div) show(div);
}

function addChangeLog(e)
{
	var src = (e.target || e.srcElement);
	collect_inputs(src, changes);
	return true;
}

function appendSetting(p, prefix,  name, value)
{
	var id = prefix+"#"+name;
	var e;
	switch(name)
	{
		case "stype":
			return;
		case "enabled": case "generate_keys": case "DirectOnly": case "IndirectData":
			e = append_radio(p, name, id, value, [["Ja", 1], ["Nein", 0]]);
			break;
		case "Name": case "ConnectTo": case "Hostnames": case "net":
			e = append_input(p, name, id, value);
			e.lastChild.disabled = "disabled";
			addClass(e, "advanced");
			break;
		case "Mode":
			e = append_radio(p, name, id, value, ["router", "switch", "hub"]);
			addClass(e, "advanced");
			break;
		case "DeviceType":
			e = append_radio(p, name, id, value, ["dummy", "tun", "tap"]);
			addClass(e, "advanced");
			break;
		case "PingTimeout": case "Port":
			e = append_input(p, name, id, value).lastChild;
			addInputCheck(e, /^[1-9]\d*$/, name + " muss eine Nummer sein.");
			break;
		//case "net":
		//	e = append_selection(p, name, id, value, nets);
		//	break;
		default:
			e = append_input(p, name, id, value);
			//addClass(e, "advanced");
	}
	e.id = id;
	chainOnchange(e, addChangeLog);
}

function reload()
{
	send("/cgi-bin/tinc", { func: "get_settings" }, function(data) {
		changes = {};
		hosts = [];
		nets = [];

		var tinc = parseUCI(data).tinc;

		config_foreach(tinc, "tinc-host", function(hn, obj) { hosts.push(hn); });
		config_foreach(tinc, "tinc-net", function(nn, obj) { nets.push(nn); });

		create_lists(tinc);
		create_fields(tinc);

		select("");
		adv_mode();
	});
}

function create_fields(tinc)
{
	var entries = get('entries');
	removeChilds(entries);

	function str2dom(str)
	{
		var e = create("span");
		e.innerHTML = str;
		return e;
	}

	function add_entry(title, id, obj)
	{
		var entry = append(entries, 'div', id+"#div");
		entry.name = id;
		hide(entry);

		var fs = append(entry, 'fieldset');
		var legend = append(fs, "legend");
		var span = append(legend, "span");
		span.innerHTML = title;

		for(var name in obj)
			appendSetting(fs, "tinc#"+id, name, obj[name]);

		return entry;
	}

	config_foreach(tinc, "tinc-host", function(hn, obj) {
		var entry = add_entry("Host: '"+hn+"'", hn, obj);
		entry.appendChild(str2dom(host_buttons.replace(/uf2/g, hn)));
	});

	config_foreach(tinc, "tinc-net", function(nn, obj) {
		var entry = add_entry("Netz: '"+nn+"'", nn, obj);
		entry.appendChild(str2dom(net_buttons.replace(/uf2/g, nn)));
	});
}

function create_lists(tinc)
{
	var ul = get('list');
	removeChilds(ul);

	function append_hosts(p, nn)
	{
		var ul = append(p, 'ul');
		config_foreach(tinc, "tinc-host", function(hn, obj) {
			if(obj.net != nn) return;
			var li = create('li');
			var a = create('a');

			a.innerHTML = "Host: '"+hn+"'";
			a.onclick = function() { var n = hn; select(n); };

			li.id = hn+"#li";
			li.appendChild(a);
			ul.appendChild(li);
	   });
	}

	config_foreach(tinc, "tinc-net", function(nn, obj) {
		var li = append(ul, 'li');
		var a = append(li, 'a');

		a.innerHTML="Netz: '"+nn+"'";
		a.onclick = function() { var n = nn; select(n); };

		li.id = nn+"#li";
		append_hosts(li, nn);
	});
}

function save_entries(prefix)
{
	var obj = { func : "set_settings" };
	for(var key in changes)
	{
		if(key.substring(0, prefix.length) != prefix) continue;
		obj[key] = changes[key];
		delete changes[key];
	}

	alert(obj.toSource());
	send("/cgi-bin/tinc", obj, function(data) {
		reload();
		setText("msg", data);
	});
}

function checkChanges()
{
	if(changes.length)
		return confirm("Ungespeicherte \xdcnderungen verwerfen?");
	return true;
}

function add_net_by_name()
{
	var nn = get("new_net_name").value;
	if(!checkChanges())
		return;

	if(!checkName(nn))
		return;

	if(get(nn+'#div'))
		return alert("Eintrag '"+nn+"' existiert bereits.");

	send("/cgi-bin/tinc",{ func : "add_net", net_name : nn }, function(data) {
		reload();
		setText("msg", data);
		get("new_net_name").value = "";
	});
}

function add_net_by_file()
{
	var nn = get("new_net_file").value;

	if(!checkChanges())
		return;

	if(!checkName(nn))
		return;

	if(get(nn+'#div'))
		return alert("Eintrag '"+nn+"' existiert bereits.");

	get("uf1").submit();
	reload();
}

function delete_host(hn)
{
	if(!checkChanges())
		return;

	if(!confirm("Host '"+hn+"' wirklich L\xf6schen?"))
		return;

	send("/cgi-bin/tinc",{ func : "del_host", host_name : hn }, function(data) {
		setText("msg", data);
		reload();
	});
}

function export_key(func, net_name, key_name)
{
	get("df_func").value = func;
	get("df_net_name").value = net_name;
	get("df_key_name").value = key_name;
	get("df").submit();
}

function export_host_key(hn)
{
	var nn = get("tinc#"+hn+"#net").lastChild.value;
	if(nn) export_key("export_public_key", nn, hn);
}

function add_host_by_key()
{
	if(!checkChanges())
		return;

	get("uf2_net_name").value = nn;
	get("uf2").submit();
	reload();
}

function net_export_public_key(nn)
{
	export_key("export_public_key", nn, nn);
}

function net_export_private_key(nn)
{
	export_key("export_private_key", nn, "");
}

function net_save_entry(nn)
{
	save_entries(nn);
}

function net_delete_entry(nn)
{
	if(!checkChanges())
		return;

	if(!confirm("Netz '"+nn+"' wirklich L\xf6schen?\nAlle zugeh\xf6rigen Host-Schl\xfcssel werden geschl\xf6scht!"))
		return;

	send("/cgi-bin/tinc",{ func : "del_net", net_name : nn }, function(data) {
		reload();
		setText("msg", data);
	});
}

reload();
