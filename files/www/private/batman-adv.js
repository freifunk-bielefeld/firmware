
function getIP(span) {
    send("/cgi-bin/misc", { func : "mac2ip", mac : span.innerHTML}, function(text) { setText("msg", text); } );
}

send("/cgi-bin/batman-adv", { func: "get_originators" }, function(text) {
    text = text.replace(mac_regex, '<span onclick="getIP(this)" class="mac">$1</span>');
    setText('originators', text);
});
