
function init() {
	$('p1').focus();
	tr();
}

function apply()
{
	p1 = $('p1').value;
	p2 = $('p2').value;

	$('p1').value = '';
	$('p2').value = '';

	if (p1 != p2) {
		setText('msg', tr('tr_password_different'));
		return;
	} else {
		setText('msg', tr('tr_password_changed'));
	}

	send('/cgi-bin/password', { func : 'set_password', pass1 : p1, pass2 : p2 }, function(data) {
		setText('msg', data);
	});
}
