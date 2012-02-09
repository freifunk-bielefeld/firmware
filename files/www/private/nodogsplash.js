
$.post("/cgi-bin/nodogsplash", { func: "get_status" }, function(data){
    if(data.length)
        $('#ndsctl_status').text(data);
});
