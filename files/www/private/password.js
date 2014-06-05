
$("p1").focus();

function apply()
{
	p1 = $('p1').value;
	p2 = $('p2').value;

	$('p1').value = "";
	$('p2').value = "";

	send("/cgi-bin/password", { func : "set_password", pass1 : p1, pass2 : p2 }, function(data) {
        setText('msg', data);
	});
}
