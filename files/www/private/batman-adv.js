
var regex = {
	get_originators : /^$/gi, //matches nothing
	get_transglobal : /(via\s+)([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gi,
	get_gateways : /^([=>\s]*)([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gim
}

function update(name) {
	setText('msg', "");
	send("/cgi-bin/batman-adv", { func : name }, function(text) {
		setText('output', text);
	});
}

function init() {
	var opt = $("load_options");
	opt.options[opt.selectedIndex].onclick();
}
