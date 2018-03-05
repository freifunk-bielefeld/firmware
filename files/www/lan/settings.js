
/*
 * All required uci packages are stored variable uci.
 * The GUI code displayes and manipulated this variable.
 */
var uci = {};
var gid = 0;


function init()
{
	send('/cgi-bin/settings', { func : 'get_settings' }, function(data) {
		uci = fromUCI(data);
		rebuild_general();
		adv_apply();
		tr();
	});
}

function updateFrom(src)
{
	var obj = {};
	collect_inputs(src, obj);
	for (var name in obj)
	{
		var value = obj[name];
		var path = name.split('#');

		var pkg = path[0];
		var sec = path[1];
		var opt = path[2];

		uci[pkg].pchanged = true;
		uci[pkg][sec][opt] = value
	}
}

function getChangeModeAction(ifname)
{
	return function(e) {
		var src = (e.target || e.srcElement);
		var mode = (src.data || src.value);
		delNetSection(ifname);
		addNetSection(ifname, mode);
	};
}

function appendSetting(p, path, value, mode)
{
	var id = path.join('#');
	var b;
	var cfg = path[0]
	var name = path[path.length-1];
	switch (name)
	{
	case 'latitude':
		b = append_input(p, 'tr_latitude', id, value);
		b.lastChild.placeholder = '52.xxx';
		addInputCheck(b.lastChild, /^$|^[1-9]\d{0,2}\.\d{1,8}$/, 'tr_invalid_gps');
		addHelp(b, 'tr_gps_help');
		break;
	case 'longitude':
		b = append_input(p, 'tr_longitude', id, value);
		b.lastChild.placeholder = '8.xxx';
		addInputCheck(b.lastChild, /^$|^[1-9]\d{0,2}\.\d{1,8}$/, 'tr_invalid_gps');
		addHelp(b, 'tr_gps_help');
		break;
	case 'name':
		b = append_input(p, 'tr_node_name', id, value);
		b.lastChild.placeholder = 'MyRouter';
		addInputCheck(b.lastChild, /^$|^[\-\^'\w\.\:\[\]\(\)\/ &@\+\u0080-\u00FF]{0,32}$/, 'tr_invalid_input');
		addHelp(b, 'tr_node_name_help');
		break;
	case 'contact':
		b = append_input(p, 'tr_contact_details', id, value);
		b.lastChild.placeholder = 'info@example.com';
		addInputCheck(b.lastChild, /^$|^[\-\^'\w\.\:\[\]\(\)\/ &@\+\u0080-\u00FF]{0,50}$/, 'tr_invalid_input');
		addHelp(b, 'tr_contact_help');
		break;
	case 'community_url':
		b = append_input(p, 'tr_community_site', id, value);
		b.lastChild.placeholder = 'http://example.de';
		b.classList.add('adv_hide');
		addInputCheck(b.lastChild, /^$|^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,4}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/, 'Ung\xfcltige URL.');
		addHelp(b, 'tr_website_help');
		break;
	case 'enabled':
		if (cfg == 'autoupdater') {
			b = append_radio(p, 'tr_autoupdater', id, value, [['tr_on', '1'], ['tr_off', '0']]);
			addHelp(b, 'tr_autoupdater_help');
		}
		if (cfg == 'simple-tc') {
			b = append_radio(p, 'tr_bandwidth_ctl', id, value, [['tr_on', '1'], ['tr_off', '0']]);
			addHelp(b, 'tr_bandwidth_control_help');
		}
		if (cfg == 'fastd') {
			b = append_radio(p, 'tr_vpn', id, value, [['tr_on', '1'], ['tr_off', '0']]);
			addHelp(b, 'tr_fastd_help');
			b.classList.add('adv_hide');
		}
		break;
	case 'publish_map':
		b = append_radio(p, 'tr_contribute_map', id, value, [['tr_none', 'none'], ['tr_basic', 'basic'], ['tr_more', 'more'], ['tr_all', 'all']]);
		addHelp(b, 'tr_contribute_map_help');
		break;
	case 'limit_egress':
		b = append_input(p, 'tr_freifunk_upload', id, value);
		addInputCheck(b.lastChild, /^\d+$/, 'tr_invalid_input');
		addHelp(b, 'tr_max_upload_help');
		break;
	case 'limit_ingress':
		b = append_input(p, 'tr_freifunk_download', id, value);
		addInputCheck(b.lastChild, /^\d+$/, 'tr_invalid_input');
		addHelp(b, 'tr_max_download_help');
		break;
	case 'allow_access_from':
		b = append_check(p, 'tr_access', id, split(value), [['WAN','wan'], ['LAN','lan'], ['Freifunk','freifunk']]);
		addHelp(b, 'tr_access_help');
		break;
	case 'service_link':
		var ula_prefix = uci['network']['globals']['ula_prefix'];
		var addr_prefix = ula_prefix.replace(/:\/[0-9]+$/,''); //cut off ':/64'
		var regexp = new RegExp('^$|((?=.*'+addr_prefix+'|.*\.ff[a-z]{0,3})(?=^.{0,128}$))');

		b = append_input(p, 'tr_service_link', id, value);
		b.lastChild.placeholder = 'http://['+addr_prefix+':1]/index.html';
		addInputCheck(b.lastChild, regexp, 'tr_invalid_input');
		addHelp(b, 'tr_external_ref_help');
		break;
	case 'service_label':
		b = append_input(p, 'tr_service_name', id, value);
		b.lastChild.placeholder = 'MyWebseite';
		addInputCheck(b.lastChild, /^$|^[\[\]\(\) \w&\/.:\u0080-\u00FF]{0,32}$/, 'tr_invalid_input');
		addHelp(b, 'tr_service_name_help');
		break;
	case 'service_display_max':
		b = append_input(p, 'tr_max_entries', id, value);
		addInputCheck(b.lastChild, /^\d+$/, 'tr_invalid_input');
		addHelp(b, 'tr_max_entries_help');
		break;
	case 'community':
		b = append_input(p, 'tr_community', id, value);
		b.classList.add('adv_hide');
		addInputCheck(b.lastChild, /^[a-z0-9_\-]{3,30}$/, 'tr_invalid_input');
		addHelp(b, 'tr_community_help');
		break;
	default:
		return;
	}

	b.id = id; //needed for updateFrom
	b.onchange = function() {
		updateFrom(b);
	};

	return b;
}

function rebuild_general()
{
	var gfs = $('general');
	var rfs = $('resource');
	var tfs = $('traffic');

	removeChilds(gfs);
	removeChilds(rfs);
	removeChilds(tfs);

	if ('freifunk' in uci) {
		var f = uci.freifunk;
		var i = firstSectionID(f, 'settings');
		appendSetting(gfs, ['freifunk', i, 'name'], f[i]['name']);
		appendSetting(gfs, ['freifunk', i, 'latitude'], f[i]['latitude']);
		appendSetting(gfs, ['freifunk', i, 'longitude'], f[i]['longitude']);
		appendSetting(gfs, ['freifunk', i, 'contact'], f[i]['contact']);
		appendSetting(rfs, ['freifunk', i, 'community_url'], f[i]['community_url']);
		appendSetting(rfs, ['freifunk', i, 'community'], f[i]['community']);
		appendSetting(gfs, ['freifunk', i, 'publish_map'], f[i]['publish_map']);
		appendSetting(gfs, ['freifunk', i, 'allow_access_from'], f[i]['allow_access_from']);
		appendSetting(rfs, ['freifunk', i, 'service_label'], f[i]['service_label']);
		appendSetting(rfs, ['freifunk', i, 'service_link'], f[i]['service_link']);
		appendSetting(rfs, ['freifunk', i, 'service_display_max'], f[i]['service_display_max']);
	}

	if ('autoupdater' in uci) {
		var a = uci.autoupdater;
		var i = firstSectionID(a, 'autoupdater');
		appendSetting(gfs, ['autoupdater', i, 'enabled'], a[i]['enabled']);
	}

	if ('simple-tc' in uci) {
		var t = uci['simple-tc'];
		var i = firstSectionID(t, 'interface');
		appendSetting(tfs, ['simple-tc', i, 'enabled'], t[i]['enabled']);
		appendSetting(tfs, ['simple-tc', i, 'limit_ingress'], t[i]['limit_ingress']);
		appendSetting(tfs, ['simple-tc', i, 'limit_egress'], t[i]['limit_egress']);
	}

	if ('fastd' in uci) {
		var a = uci.fastd;
		var i = firstSectionID(a, 'fastd');
		appendSetting(gfs, ['fastd', i, 'enabled'], a[i]['enabled']);
	}
}

function save_data()
{
	for (var name in uci)
	{
		var obj = uci[name];
		if (!obj.pchanged)
			continue;
		var data = toUCI(obj);
		send('/cgi-bin/misc', { func : 'set_config_file', name : name, data : data },
			function(data) {
				$('msg').textContent = data;
				$('msg').focus();
				init();
			}
		);
	}
}
