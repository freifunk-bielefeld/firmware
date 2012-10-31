
function set_settings()
{
    function invert_by_value(obj, value) {
        obj[value] = "";
        for(var name in obj) if(obj[name] == value) {
            obj[value] += name + " ";
            delete obj[name];
        }
    }
   
    var obj = { func : "set_settings" };
    collect_inputs(get("content"), obj);
    
    invert_by_value(obj, "mesh_ifs");
    invert_by_value(obj, "bat_ifs");
    invert_by_value(obj, "lan_ifs");
    invert_by_value(obj, "wan_ifs");
    
    send("/cgi-bin/settings", obj,
        function(data) { setText('msg', data); }
    );
}

function load_settings()
{
    send("/cgi-bin/settings", { func : "get_settings" }, function(data) 
    {
        var obj = parseJSON(data);
        var fs = get('common');
        removeChilds(fs);
        
        var legend = create('legend');
        legend.innerHTML="Allgemeine Einstellungen:";
        fs.appendChild(legend);
        
        //append_input(fs, "AccessPoint", "ap_ssid", obj.ap_ssid);
        append_radio(fs, "Internet Freigeben", "share_internet", obj.share_internet, {"Ja":"yes", "Nein":"no"});
        append_input(fs, "MAC-Adresse", "mac", obj.mac);
        append_check(fs, "SSH/HTTPS Freigeben", "config_nets", split(obj.config_nets), {"Wan":"wan", "Lan":"lan", "Mesh":"mesh"});

        rebuild_interfaces(obj);
    });
}

//rebuild interfaces section from interfaces lists
function rebuild_interfaces(obj)
{
    var fieldset = get('interfaces');
    var legend = create('legend');
    
    removeChilds(fieldset);
    
    legend.innerHTML = "Anschl\xFCsse Zuordnen:";
    fieldset.appendChild(legend);
   
    function add_interfaces(ifs, selected) {
        if(typeof ifs == "undefined") return;
        var array = split(ifs);
        for(var i = 0; i < array.length; ++i)
            append_radio(fieldset, array[i], array[i], selected, {"Mesh" :  "mesh_ifs", "Bat" : "bat_ifs", "Lan" : "lan_ifs", "Wan" : "wan_ifs"});
    }
    
    add_interfaces(obj.mesh_interfaces, "mesh_ifs");
    add_interfaces(obj.bat_interfaces, "bat_ifs");
    add_interfaces(obj.lan_interfaces, "lan_ifs");
    add_interfaces(obj.wan_interfaces, "wan_ifs");
}

load_settings();
