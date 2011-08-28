$.get("/cgi-bin/dispatch", { func: "get_batman" }, function(data){
    $('#text').text(data);
});

$.get("/cgi-bin/dispatch", { func: "get_settings_ah_ssid" }, function(data){
    $('#ah_ssid').text(data);
});

$.get("/cgi-bin/dispatch", { func: "get_settings_ap_ssid" }, function(data){
    $('#ap_ssid').text(data);
});
    
$.get("/cgi-bin/dispatch", { func: "get_batman_mode" }, function(data){
     $('#batman_mode').text(data);                                                    
});