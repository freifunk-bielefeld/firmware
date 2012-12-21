
var changes = {};

function mysend(obj) {
	send("/cgi-bin/n2n", obj, function(data) {
		setText('msg', data);
		rebuild_config();
	});
}

function createDelAction(n) {
	return function() {
		if(confirm("Eintrag wirklich L\xF6schen?"))
			mysend({ func : "del_entry", name : n });
	};
}

function addChangeLog(e)
{
	var src = (e.target || e.srcElement);
	collect_inputs(src, changes);
	return true;
}


function createSetAction(fieldset, n) {
	return function() {
		save_config(n);
	};
}

function appendSettings(parent, n, obj)
{
	for(var name in obj)
	{
		var value = obj[name];
		var id = n+"#"+name;
		var e;
		switch(name)
		{
		case "stype":
			continue;
		case "enabled": case "route":
			e = append_radio(parent, name, id, value, [["Ja", 1], ["Nein", 0]]);
			break;
		case "mtu": case "port":
			e = append_input(parent, name, id, value);
			addInputCheck(e.lastChild, /^[1-9]\d*$/, name + " muss eine Nummer sein.");
			break;
		default:
			e = append_input(parent, name, id, value);
		}
		e.id = id;
		chainOnchange(e, addChangeLog);
	}
}

function parse_config(data)
{
	var objs = parseUCI(data);
	var p = get('data');
	removeChilds(p);

	for(var name in objs.n2n)
	{
		var obj = objs.n2n[name];
		if(obj.stype != "edge") continue;

		var fieldset = append_section(p, "Verbindung: '" + name + "'");

		appendSettings(fieldset, name, obj);

		var div = append(fieldset, 'div');
		append_button(div, 'L\xF6schen', createDelAction(name));
		append_button(div, 'Speichern', createSetAction(fieldset, name));

		p.appendChild(fieldset);
	}
}

function add_entry()
{
	var name = get("new_name").value;

	if(get(name+"#enabled"))
		return alert("Eintrag '"+name+"' existiert bereits.");

	if(!checkName(name))
		return;

	mysend({ func : "add_entry", name : name });
}

function save_config(prefix)
{
	var obj = { func : "save_settings" };
	for(var key in changes)
	{
		if(key.substring(0, prefix.length) != prefix) continue;
		obj[key] = changes[key];
		delete changes[key];
	}
	mysend(obj);
}

function rebuild_config()
{
	changes = {};
	get("new_name").value = "";
	send("/cgi-bin/n2n", { func: "get_settings" }, parse_config);
}

rebuild_config();
