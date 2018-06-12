
function formatSize(bytes) {
	if (typeof bytes === 'undefined' || bytes == '') {
		return '-';
	} else if (bytes < 1000) {
		return bytes + '  B';
	} else if (bytes < 1000*1000) {
		return (bytes/ 1000.0).toFixed(0)  + ' K';
	} else if (bytes < 1000*1000*1000) {
		return (bytes/1000.0/1000.0).toFixed(1)  + ' M';
	} else {
		return (bytes/1000.0/1000.0/1000.0).toFixed(2) + ' G';
	}
}

function formatSpeed(bytes) {
	var fmt = formatSize(bytes);
	return (fmt == '-') ? '-' : (fmt + '/s');
}

function init() {
	send('/cgi-bin/home', { }, function(data) {
		var obj = fromUCI(data).misc.data;
		for (var key in obj) {
			var value = obj[key];

			if (key == 'stype') {
				continue;
			}

			// for data volume
			if (key.endsWith('_data')) {
				value = formatSize(value);
			}

			// for transfer speed
			if (key.endsWith('_speed')) {
				value = formatSpeed(value);
			}

			//for addresses
			if (typeof(value) == 'object') {
				value = '<ul><li>'+value.join('</li><li>')+'</li></ul>'
			}

			setText(key, value);
		}
		tr();
	});

	addHelp($('system'), 'tr_system_help');
	addHelp($('freifunk'), 'tr_mesh_help');
	addHelp($('lan'), 'tr_lan_help');
	addHelp($('wan'), 'tr_wan_help');
	addHelp($('software'), 'tr_software_help');
	addHelp($('freifunk_user_count'), 'tr_user_count_hours_help');
	addHelp($('lan_user_count'), 'tr_user_count_hours_help');
	addHelp($('vpn_server'), 'tr_vpn_help');
}
