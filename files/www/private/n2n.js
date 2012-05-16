
function mysend(obj) {
    send("/cgi-bin/n2n", obj, function(data) {
        setText('msg', data);
    });
}

function mysend_rebuild(obj) {
    send("/cgi-bin/n2n", obj, function(data) {
        setText('msg', data);
        rebuild_config();
    });
}

function createDelAction(n) {
    return function() {
        if(confirm("Eintrag wirklich L\xF6schen?"))
            mysend_rebuild({ func : "del_config", name : n });
    }
}

function createSetAction(fieldset, n) {
    return function() {
        var obj = { func : "set_config", name : n };
        collect_inputs(fieldset, obj);
        mysend(obj);
    }
}

function appendSettings(parent, n, obj)
{
    for(var setting in obj)
    {
        var label = setting;
        var value = obj[setting];
        var name = n+"_"+setting;
        if(inArray(setting, ["enabled"])) {
            append_radio(parent, label, name, value, {"Ja":1, "Nein":0});
        } else {
            append_input(parent, label, name, value);
        }
    }
}

function parse_config(data)
{
    var objs = parseJSON(data);
    var p = get('data');
    
    removeChilds(p);
    
    for (var name in objs)
    {
        var obj = objs[name];
        
        var fieldset = create('fieldset');
        var legend = create('legend');
        var span = create('span');
        
        span.innerHTML = "Verbindung: '" + name + "'";
        legend.appendChild(span);
        fieldset.appendChild(legend);
        
        appendSettings(fieldset, name, obj);

        var div = create('div');
        append_button(div, 'L\xF6schen', createDelAction(name));
        append_button(div, 'Speichern', createSetAction(fieldset, name));
        
        fieldset.appendChild(div);
        p.appendChild(fieldset);
    }
}

function add_config() {
    var name = get("new_name").value;
    mysend_rebuild({ func : "add_config", name : name });
}

function save_config() {
    mysend_rebuild({ func : "save_config" });
}

function rebuild_config() {
    send("/cgi-bin/n2n", { func: "get_configs" }, parse_config);
}

rebuild_config();
