
function init() {
	/* Nothing to do */
}

function restore_firmware() {
	if(!confirm("Sollen alle Einstellungen zur\xFCckgesetzt werden?")) return;
	send("/cgi-bin/upgrade", { func : 'restore_firmware' }, function(text) {
		setText('msg', text);
	});
}

function lookup_upgrade() {
	send("/cgi-bin/upgrade", { func : 'lookup_upgrade' }, function(text) {
		setText('msg', text);
	});
}

function lookup_and_apply_upgrade() {
	if(!confirm("Soll ein Update durchgef\xFChrt werden?")) return;
	send("/cgi-bin/upgrade", { func : 'lookup_and_apply_upgrade' }, function(msg) {
		setText('msg', text);
	});
}
