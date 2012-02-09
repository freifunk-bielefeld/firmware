
document.getElementById("ap_ssid").focus();

$('#apply_button').click(function() {
    alert("save button not implemented");
});

function get(id) {
    return document.getElementById(id).value;
}

function set(id, val) {
    document.getElementById(id).value = val;
}

function set_settings() {
    $.post("/cgi-bin/settings", {
        func : "set_settings",
        ap_ssid : get("ap_ssid"),
        ah_ssid : get("ah_ssid"),
        mesh_ifs : get("mesh_ifs"),
        bat_ifs : get("bat_ifs"),
        mac : get("mac") },
        function(data) { $('#status').text(data); }
    );
}

function load_settings() {
    $.post("/cgi-bin/settings", { func : "get_settings" }, function(data) {           
        var obj = jQuery.parseJSON(data);                                           
        set("ap_ssid", obj.ap_ssid);                                                
        set("ah_ssid", obj.ah_ssid);                                                
        set("mesh_ifs", obj.mesh_ifs);                                              
        set("bat_ifs", obj.bat_ifs);                                                
        set("mac", obj.mac);             
    });
}

load_settings();

