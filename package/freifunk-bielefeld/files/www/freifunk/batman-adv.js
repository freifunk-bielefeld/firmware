$.get("/cgi-bin/batman-adv", { func: "batclt_o" }, function(data){
    $('#batctl_o').text(data);
});