
function init() {
	tr();
}

function restore_firmware() {
	if (!confirm(tr("tr_really_reset"))) {
		return;
	}

	send("/cgi-bin/upgrade", { func : 'restore_firmware' }, function(text) {
		setText('msg', text);
	});
}

function lookup_upgrade() {
	setText('msg', tr('tr_try_server'));
	send("/cgi-bin/upgrade", { func : 'lookup_upgrade' }, function(text) {
		setText('msg', text);
	});
}

function lookup_and_apply_upgrade() {
	if (!confirm(tr("tr_really_update"))) {
		return;
	}

	setText('msg', tr('tr_manual_update'));
	send("/cgi-bin/upgrade", { func : 'lookup_and_apply_upgrade' }, function(text) {
		setText('msg', text);
	});
}
