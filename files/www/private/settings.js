
document.getElementById("ap_ssid").focus();

var wan_ifs = {};
var ext_ifs = {};
var mesh_ifs = {};


function get(id) {
    return document.getElementById(id).value;
}

function set(id, val) {
    document.getElementById(id).value = val;
}

function removeChilds(p) {
    while(p.hasChildNodes())
        p.removeChild(p.firstChild);
}

function set_settings()
{
    function toString(obj)
    {
        var str = "";
        for(var item in obj)
            str += item + " ";
        return jQuery.trim(str);
    }
        
    $.post("/cgi-bin/settings",
        {
            func : "set_settings",
            ap_ssid : get("ap_ssid"),
            ah_ssid : get("ah_ssid"),
            share_wan : get("share_wan"),
            mac : get("mac"),
            mesh_ifs : toString(mesh_ifs),
            wan_ifs : toString(wan_ifs),
            ext_ifs : toString(ext_ifs)
        },
        function(data) { $('#status').text(data); }
    );
}

function load_settings()
{
    function toObject(str)
    {
        var obj = {};
        var array = str.split(" ");
        for(var i = 0; i < array.length; i++)
            if(array[i].length > 0)
                obj[array[i]] = true;
        return obj;
    }
        
    $.post("/cgi-bin/settings", { func : "get_settings" }, function(data) 
    {
        var obj = jQuery.parseJSON(data);
        
        set("ap_ssid", obj.ap_ssid);
        set("ah_ssid", obj.ah_ssid);
        set("share_wan", obj.share_wan);
        set("mac", obj.mac);
        
        wan_ifs = toObject(obj.wan_ifs);
        mesh_ifs = toObject(obj.mesh_ifs);
        ext_ifs = toObject(obj.ext_ifs);
        
        rebuild_interfaces();
    });
}

//keep interface lists in sync when selection changes
function move_if(set_name, if_name)
{
    delete wan_ifs[if_name];
    delete mesh_ifs[if_name];
    delete ext_ifs[if_name];
    
    if(set_name == "mesh")
        mesh_ifs[if_name] = true;
    else if(set_name == "ext")
        ext_ifs[if_name] = true;
    else if(set_name == "wan")
        wan_ifs[if_name] = true;
    else
        alert("error: invalid set '" + set_name + "'");
}

function add_interfaces(fieldset, ifs, select)
{
    for(var if_name in ifs)
    {
        if(if_name.length == 0)
            continue;
        
        var div = document.createElement('div');
        div.className = "radio";
        
        var label = document.createElement('label');
        label.innerHTML = if_name;
        div.appendChild(label);
        
        function getChoice(if_name, choice_name, choice_label)
        {
            var div = document.createElement('div');
            var input = document.createElement('input');
            var label = document.createElement('label');
            
            label.innerHTML = " " + choice_label;
            input.name = if_name;
            input.value = choice_name;
            input.type = "radio";
            
            if(choice_name == select)
                input.checked="checked";
            
            input.onclick = function() { 
                var set_name = this.value;
                var if_name = this.name;
                move_if(set_name, if_name);
            };
            
            div.appendChild(input);
            div.appendChild(label);
            
            return div;
        }
        
        div.appendChild(getChoice(if_name, "mesh", "mesh"));
        div.appendChild(getChoice(if_name, "ext", "extern"));
        div.appendChild(getChoice(if_name, "wan", "wan"));
        
        fieldset.appendChild(div);
    }
}

//rebuild interfaces section from interfaces lists
function rebuild_interfaces()
{
    var fieldset = document.getElementById('interfaces');
    var legend = document.createElement('legend');
    
    removeChilds(fieldset);
    
    legend.innerHTML = "Anschl&uuml;sse Zuordnen:";
    fieldset.appendChild(legend);

    add_interfaces(fieldset, mesh_ifs, "mesh");
    add_interfaces(fieldset, ext_ifs, "ext");
    add_interfaces(fieldset, wan_ifs, "wan");
}

$('#set_button').click(function() {
    set_settings();
});

$('#save_button').click(function() {
    $.post("/cgi-bin/save_settings", { func : "save_settings" }, function(data) {
        if(data.length)
            $('#status').text(data);
    });
});

load_settings();
