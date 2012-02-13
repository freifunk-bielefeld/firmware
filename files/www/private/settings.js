
document.getElementById("ap_ssid").focus();

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
        ext_ifs : get("ext_ifs"),
        mesh_ifs : get("mesh_ifs"),
        mac : get("mac") },
        function(data) { $('#status').text(data); }
    );
}

function load_settings() {
    $.post("/cgi-bin/settings", { func : "get_settings" }, function(data) {
        var obj = jQuery.parseJSON(data);
        set("ap_ssid", obj.ap_ssid);
        set("ah_ssid", obj.ah_ssid);
        set("ext_ifs", obj.ext_ifs);
        set("mesh_ifs", obj.mesh_ifs);
        set("mac", obj.mac);
    });
}

$('#apply_button').click(function() {
    set_settings();
});

$('#save_button').click(function() {
    $.post("/cgi-bin/n2n", { func : "save_settings" }, function(data) {
        if(data.length)
            $('#status').text(data);
    });
});

load_settings();
