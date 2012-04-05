function send(obj) {
    $.post("/cgi-bin/tinc", obj, function(data) {
        $('#status').text(data); 
    });
}

function send_rebuild(obj) {
    $.post("/cgi-bin/tinc", obj, function(data) {
        $('#status').text(data);
        rebuild_nets_config();
    });
}

function parse_nets_config(data) {
   var objs = jQuery.parseJSON(data);
    var p = document.getElementById("nets");
    removeChilds(p);
    
    for (var nn in objs)
    {
        var obj = objs[nn];
        
        var fieldset = document.createElement('fieldset');                           
        var legend = document.createElement('legend');                               
        var span = document.createElement('span');

        span.innerHTML = "Netz '" + nn + "'";
        legend.appendChild(span);                                                    
        fieldset.appendChild(legend)
        
        append_radio(fieldset, "Aktiv", nn + "_enabled", {"Ja":1, "Nein":0}, obj.enabled);
        append_input(fieldset, "Name", nn + "_Name", obj.Name);
        append_input(fieldset, "ConnectTo", nn + "_ConnectTo", obj.ConnectTo); //TODO: make list
        
        var div = document.createElement('div');
 
        append_button(div, 'L&ouml;schen', function() {
            //var id = getParentId(this);
            if(confirm("Eintrag wirklich Loeschen?"))
                send_rebuild({ func : "del_net", net_name : nn });
        });
        
        append_button(div, 'Speichern', function() {
            send({ func : "set_net", net_name : nn,
                enabled : getRadioVal(nn + "_enabled"),
                Name : getInputVal(nn + "_Name"),
                ConnectTo : getInputVal(nn + "_ConnectTo")}
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

function rebuild_nets_config() {
    $.post("/cgi-bin/tinc", { func: "get_nets" }, parse_nets_config);
}

rebuild_nets_config();
