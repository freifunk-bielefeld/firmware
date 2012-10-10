
function getIP(span) {
    send("/cgi-bin/misc", { func : "mac2ip", mac : span.innerHTML}, function(text) { setText("msg", text); } );
}

function update(name) {
    send("/cgi-bin/batman-adv", { func : name }, function(text) {
        text = text.replace(mac_regex, '<span onclick="getIP(this)" class="mac">$1</span>');
        setText('output', text);
    });
}

update("get_originators");
