
var mac_regex = /([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gi;

function addIP(span)
{
	var mac = span.innerHTML;
	var ul = get('nds_macs');

	onChilds(ul, 'LABEL', function(e) { if(e.textContent == mac) mac = ""; });
	if(mac.length == 0) return;

	var label = create('LABEL');
	label.onclick = function() { ul.removeChild(this); };
	label.appendChild(document.createTextNode(mac));

	ul.appendChild(label);
}

function addDeleteButton(div, filename)
{
	append_button(div, "L&ouml;schen", function() {
		if(!confirm("Datei '"+filename+"' wirklich l\xF6schen?")) return;
		send("/cgi-bin/nodogsplash", { func: "delete_file", filename : filename }, function(data) {
			setText('msg', data);
			reload();
		});
	});
}

function reload()
{
	send("/cgi-bin/nodogsplash", { func: "get_status" }, function(text) {
		if(text.length == 0) return;
		text = text.replace(mac_regex, '<span onclick="addIP(this)" class="mac">$1</span>');
		setText('nds_status', text);
	});

	send("/cgi-bin/nodogsplash", { func: "list_files" }, function(text) {
		var span = get('nds_files');
		removeChilds(span);
		var files = split(text);
		for(var i in files)
		{
			var div = append(span, 'div');
			var label = append(div, 'label');
			var a = append(label, 'a');
			a.href="/cgi-bin/nodogsplash?func=download_file&filename="+files[i];
			a.innerHTML = files[i];
			addDeleteButton(div, files[i]);
		}
	});
}

function button_action(func)
{
	var macs = "";
	onChilds(get('nds_macs'), 'LABEL', function(e) { macs += " " + e.textContent; });

	if(macs.length == 0) return;
	send("/cgi-bin/nodogsplash", { func : func, macs : macs }, function(data) {
		setText('msg', data);
	});
}

reload();
