$.get("/cgi-bin/batman-adv", { func: "batclt_o" }, function(data){
    $('#data').text(data);
});