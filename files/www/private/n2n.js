
function send(obj) {
    $.post("/cgi-bin/n2n", obj, function(data) {
        $('#msg').text(data); 
    });
}

function send_rebuild(obj) {
    $.post("/cgi-bin/n2n", obj, function(data) {
        $('#msg').text(data);
        rebuild_config();
    });
}

function createDelAction(n) {
    return function() {
        if(confirm("Eintrag wirklich Loeschen?"))
            send_rebuild({ func : "del_config", id : n });
    }
}

function createSetAction(fieldset, n) {
    return function() {
        var obj = { func : "set_config", id : n};
        collect_inputs(fieldset, obj);
        send(obj);
    }
}

function parse_config(data)
{
    var objs = jQuery.parseJSON(data);
    var p = document.getElementById('data');
    
    removeChilds(p);
    
    for (var n in objs)
    {
        var obj = objs[n];
        
        var fieldset = document.createElement('fieldset');
        var legend = document.createElement('legend');
        var span = document.createElement('span');
        
        span.innerHTML = "Verbindung " + n.replace("entry_", "");
        legend.appendChild(span);
        fieldset.appendChild(legend);
        
        append_input(fieldset, "Supernode", "supernode", obj.supernode);
        append_input(fieldset, "Port", "port", obj.port);
        append_input(fieldset, "Community", "community", obj.community);
        append_input(fieldset, "Key", "key", obj.key);
        
        var div = document.createElement('div');
        
        append_button(div, 'L&ouml;schen', createDelAction(n));
        append_button(div, 'Speichern', createSetAction(fieldset, n));
        
        fieldset.appendChild(div);
        p.appendChild(fieldset);
    }
}

function add_config() {
    send_rebuild({ func : "add_config" });
}

function apply_config() {
    send({ func : "apply_config" });
}

function save_config() {
    send_rebuild({ func : "save_config" });
}

function rebuild_config() {
    $.post("/cgi-bin/n2n", { func: "get_config" }, parse_config);
}

rebuild_config();
