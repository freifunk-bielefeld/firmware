
$.post("/cgi-bin/batman-adv", { func: "get_originators" }, function(data) {
    $('#originators').text(data);
});
