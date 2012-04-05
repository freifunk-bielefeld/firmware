
function send(obj) {
    $.post("/cgi-bin/n2n", obj, function(data) {
        $('#status').text(data); 
    });
}

function send_rebuild(obj) {
    $.post("/cgi-bin/n2n", obj, function(data) {
        $('#status').text(data);
        rebuild_config();
    });
}

function parse_config(data) {
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
        
        append_button(div, 'L&ouml;schen', function() {
            if(confirm("Eintrag wirklich Loeschen?"))
                send_rebuild({ func : "del_config", id : n });
        });
        
        append_button(div, 'Speichern', function() {
            send({ func : "set_config", id : n,
                supernode : getInputVal(n + "_supernode"),
                port : getInputVal(n + "_port"),
                community : getInputVal(n + "_community"),
                key : getInputVal(n + "_key") }
            );
        });
        
        fieldset.appendChild(div);
        p.appendChild(fieldset);
    }
}

$('#add_button').click(function() {
    send_rebuild({ func : "add_config" });
});

$('#apply_button').click(function() {
    send({ func : "apply_config" });
});

$('#save_button').click(function() {
    send_rebuild({ func : "save_config" });
});

function rebuild_config() {
    $.post("/cgi-bin/n2n", { func: "get_config" }, parse_config);
}

rebuild_config();
