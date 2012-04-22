
send("/cgi-bin/batman-adv", { func: "get_originators" }, function(data) {
    setText('originators', data);
});
