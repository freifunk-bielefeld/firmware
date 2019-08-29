
function init() {
	send('/cgi-bin/ssh_keys', { func : 'get_authorized_keys' }, function(reply) {
		$('ssh_keys').value = reply;
		verify_keys();
	});

	$('ssh_keys_submit_button').onclick = function() {
		var keys = $('ssh_keys').value;
		send("/cgi-bin/ssh_keys", { func : 'set_authorized_keys', data: keys }, function(reply) {
			setText('msg', reply);
		});
	}

	tr();
}

function verify_keys() {
	var regex = /^(ssh-rsa [\w\/+=]{60,} [\w@.=]+[\n]*)*$/;
	var keys = $('ssh_keys').value;
	$('ssh_keys_submit_button').disabled = keys.match(regex) ? '' : 'disabled';
}
