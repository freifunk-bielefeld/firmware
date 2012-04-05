
document.getElementById("ap_ssid").focus();

var wan_ifs = {};
var bat_ifs = {};
var mesh_ifs = {};
var lan_ifs = {};

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
            ap_ssid : getInputVal("ap_ssid"),
            ah_ssid : getInputVal("ah_ssid"),
            share_wan : getRadioVal("share_wan"),
            mac : getInputVal("mac"),
            mesh_ifs : toString(mesh_ifs),
            wan_ifs : toString(wan_ifs),
            lan_ifs : toString(lan_ifs),
            bat_ifs : toString(bat_ifs)
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
        
        setInputVal("ap_ssid", obj.ap_ssid);
        setInputVal("ah_ssid", obj.ah_ssid);
        setRadioVal("share_wan", obj.share_wan);
        setInputVal("mac", obj.mac);
        
        wan_ifs = toObject(obj.wan_ifs);
        mesh_ifs = toObject(obj.mesh_ifs);
        lan_ifs = toObject(obj.lan_ifs);
        bat_ifs = toObject(obj.bat_ifs);
        
        rebuild_interfaces();
    });
}

//keep interface lists in sync when selection changes
function move_if(set_name, if_name)
{
    delete wan_ifs[if_name];
    delete mesh_ifs[if_name];
    delete bat_ifs[if_name];
    
    if(set_name == "mesh")
        mesh_ifs[if_name] = true;
    else if(set_name == "bat")
        bat_ifs[if_name] = true;
    else if(set_name == "lan")
        lan_ifs[if_name] = true;
    else if(set_name == "wan")
        wan_ifs[if_name] = true;
    else
        alert("error: invalid set '" + set_name + "'");
}

//rebuild interfaces section from interfaces lists
function rebuild_interfaces()
{
    var fieldset = document.getElementById('interfaces');
    var legend = document.createElement('legend');
    
    removeChilds(fieldset);
    
    legend.innerHTML = "Anschl&uuml;sse Zuordnen:";
    fieldset.appendChild(legend);
    
    function add_interfaces(ifs, selected) {
        for(var if_name in ifs) {
            if(if_name.length == 0)
                continue;
            
            append_radio(fieldset, if_name, if_name, {"Mesh" : "mesh", "Bat" : "bat", "Lan" : "lan", "Wan" : "wan"}, selected);
        }
    }

    add_interfaces(mesh_ifs, "mesh");
    add_interfaces(bat_ifs, "bat");
    add_interfaces(lan_ifs, "lan");
    add_interfaces(wan_ifs, "wan");
    
    $(fieldset).find("input").click(function() {
        var set_name = this.value;
        var if_name = this.name;
        move_if(set_name, if_name);
    });
}

$('#set_button').click(function() {
    set_settings();
});

$('#save_button').click(function() {
    $.post("/cgi-bin/settings", { func : "save_settings" }, function(data) {
        if(data.length)
            $('#status').text(data);
    });
});

load_settings();
