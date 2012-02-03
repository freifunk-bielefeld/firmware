$.post("/cgi-bin/batman-adv", { func: "batctl_o" }, function(data){
    $('#batctl_o').text(data);
});