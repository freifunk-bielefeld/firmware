
function getIP(span) {
	send("/cgi-bin/misc", { func : "mac2ip", mac : span.innerHTML }, function(text) { setText("msg", text); } );
}

var regex = {
	get_originators : /^$/gi, //matches nothing
	get_transglobal : /(via\s+)([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gi,
	get_gateways : /^([=>\s]*)([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gim
}

function update(name) {
	setText('msg', "");
	send("/cgi-bin/batman-adv", { func : name }, function(text) {
		text = text.replace(regex[name], '$1<span onclick="getIP(this)" class="mac">$2</span>');
		setText('output', text);
	});
}

function reload() {
	var opt = $("load_options");
	opt.options[opt.selectedIndex].onclick();
}
