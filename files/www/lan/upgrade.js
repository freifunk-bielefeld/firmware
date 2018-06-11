
function init() {
	/* Nothing to do */
}

function restore_firmware() {
	if (!confirm("Should all settings be reset?")) {
		return;
	}

	send("/cgi-bin/upgrade", { func : 'restore_firmware' }, function(text) {
		setText('msg', text);
	});
}

function lookup_upgrade() {
	setText('msg', 'Attempts to reach update servers. Please wait ...');
	send("/cgi-bin/upgrade", { func : 'lookup_upgrade' }, function(text) {
		setText('msg', text);
	});
}

function lookup_and_apply_upgrade() {
	if (!confirm("Should an update be carried out?")) {
		return;
	}

	setText('msg', 'Attempts to reach update servers. Please wait ...');
	send("/cgi-bin/upgrade", { func : 'lookup_and_apply_upgrade' }, function(text) {
		setText('msg', text);
	});
}
