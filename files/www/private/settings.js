
function set_settings()
{
    /*
    function invert_by_name(obj, name) {
        var value = obj[name];
        if(value in obj)
            obj[value] += " " + name;
       else
            obj[value] = name;
        delete obj[name];
    }*/
    
    function invert_by_value(obj, value)
    {
        for(var name in obj) if(obj[name] == value)
        {
            if(value in obj)
                obj[value] += " " + name;
            else
                obj[value] = name;
        }
        delete obj[name];
    }
   
    var pre = "settings_";
    var obj = { func : "set_settings" };
    collect_inputs(get("content"), obj, pre);
    
    invert_by_value(obj, pre+"mesh");
    invert_by_value(obj, pre+"bat");
    invert_by_value(obj, pre+"lan");
    invert_by_value(obj, pre+"wan");
    
    $.post("/cgi-bin/settings", obj,
        function(data) { $('#msg').text(data); }
    );
}

function save_settings() {
    $.post("/cgi-bin/settings", { func : "save_settings" }, function(data) {
        if(data.length)
            $('#msg').text(data);
    });
}

function load_settings()
{
    $.post("/cgi-bin/settings", { func : "get_settings" }, function(data) 
    {
        var obj = jQuery.parseJSON(data);
        var fs = document.getElementById('common');
        removeChilds(fs);
        
        var legend = document.createElement('legend');
        legend.innerHTML="Allgemeine Einstellungen:";
        fs.appendChild(legend);
        
        append_input(fs, "AccessPoint", "ap_ssid", obj.ap_ssid);
        append_input(fs, "AdHoc", "ah_ssid", obj.ah_ssid);
        append_radio(fs, "Internet Freigeben", "share_wan", obj.share_wan, {"Ja":"yes", "Nein":"no"});
        append_input(fs, "MAC-Adresse", "mac", obj.mac);
      
        rebuild_interfaces(obj);
    });
}

//rebuild interfaces section from interfaces lists
function rebuild_interfaces(obj)
{
    var fieldset = document.getElementById('interfaces');
    var legend = document.createElement('legend');
    
    removeChilds(fieldset);
    
    legend.innerHTML = "Anschl&uuml;sse Zuordnen:";
    fieldset.appendChild(legend);
   
    function add_interfaces(ifs, selected) {
        if(typeof ifs == "undefined") return;
        var array = ifs.split(" ");
        for(var i in array)
        {
            var if_name = array[i]
            if(array[i].length == 0)
                continue;
            
            append_radio(fieldset, if_name, if_name, selected, {"Mesh" : "mesh", "Bat" : "bat", "Lan" : "lan", "Wan" : "wan"});
        }
    }
    
    add_interfaces(obj.mesh_interfaces, "mesh");
    add_interfaces(obj.bat_interfaces, "bat");
    add_interfaces(obj.lan_interfaces, "lan");
    add_interfaces(obj.wan_interfaces, "wan");
}

load_settings();
