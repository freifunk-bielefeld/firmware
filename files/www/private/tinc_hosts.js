
function send(obj) {
    $.post("/cgi-bin/tinc", obj, function(data) {
        $('#status').text(data); 
    });
}

function send_rebuild(obj) {
    $.post("/cgi-bin/tinc", obj, function(data) {
        $('#status').text(data);
        rebuild_hosts_config();
    });
}


function parse_hosts_config(data) {
    var objs = jQuery.parseJSON(data);
    var p = document.getElementById("hosts");
    removeChilds(p);
    
    for (var hn in objs)
    {
        var obj = objs[hn];
        //var nn = obj.obj.net_name; //TODO
        
        var fieldset = document.createElement('fieldset');                           
        var legend = document.createElement('legend');                               
        var span = document.createElement('span');

        span.innerHTML = "Host '" + hn + "'";
        legend.appendChild(span);                                                    
        fieldset.appendChild(legend)
        
        append_radio(fieldset, "Verbinden", hn + "_enabled", {"Ja":1, "Nein":0}, obj.enabled);
        append_input(fieldset, "Netz", hn + "_net", obj.net);
        append_input(fieldset, "Address", hn + "_Address", obj.Address);
        append_input(fieldset, "Port", hn + "_Port", obj.Port);
        
        var div = document.createElement('div');
        
        append_button(div, 'L&ouml;schen', function() {
            if(confirm("Eintrag wirklich Loeschen?"))
                send({ func : "del_host", host_name : hn });
        });
        
        append_button(div, 'Speichern', function() {
            send({ func : "set_host", host_name : hn,
                enabled : getRadioVal(hn + "_enabled"),
                net : getInputVal(hn + "_net")}
            );
        });
        
        append_button(div, 'Export', function() {
            send({ func : "export_key", host_name : hn, net_name : nn });
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

function rebuild_hosts_config() {
    $.post("/cgi-bin/tinc", { func: "get_hosts" }, parse_hosts_config);
}

rebuild_hosts_config();
