
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
            mysend_rebuild({ func : "del_config", id : n });
    }
}

function createSetAction(fieldset, n) {
    return function() {
        var obj = { func : "set_config", id : n};
        collect_inputs(fieldset, obj);
        mysend(obj);
    }
}

function parse_config(data)
{
    var objs = parseJSON(data);
    var p = get('data');
    
    removeChilds(p);
    
    for (var n in objs)
    {
        var obj = objs[n];
        
        var fieldset = create('fieldset');
        var legend = create('legend');
        var span = create('span');
        
        span.innerHTML = "Verbindung " + n.replace("entry_", "");
        legend.appendChild(span);
        fieldset.appendChild(legend);
        
        append_input(fieldset, "Supernode", "supernode", obj.supernode);
        append_input(fieldset, "Port", "port", obj.port);
        append_input(fieldset, "Community", "community", obj.community);
        append_input(fieldset, "Key", "key", obj.key);
        
        var div = create('div');
        
        append_button(div, 'L\xF6schen', createDelAction(n));
        append_button(div, 'Speichern', createSetAction(fieldset, n));
        
        fieldset.appendChild(div);
        p.appendChild(fieldset);
    }
}

function add_config() {
    mysend_rebuild({ func : "add_config" });
}

function apply_config() {
    mysend({ func : "apply_config" });
}

function save_config() {
    mysend_rebuild({ func : "save_config" });
}

function rebuild_config() {
    send("/cgi-bin/n2n", { func: "get_config" }, parse_config);
}

rebuild_config();
