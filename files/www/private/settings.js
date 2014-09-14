
/*
All required uci packages are stored variable uci.
The GUI code displayes and manipulated this variable.
*/
var uci = {};
var gid = 0;


function init()
{
	send("/cgi-bin/settings", { func : "get_settings" }, function(data) {
		uci = fromUCI(data);
		rebuild_general();
	});
}

function updateFrom(src)
{
	var obj = {};
	collect_inputs(src, obj);
	for(var name in obj)
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
		var mode = src.value;
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
	switch(name)
	{
	case "geo":
		b = append_input(p, "GPS-Koordinaten", id, value);
		addInputCheck(b.lastChild,/^\d{1,3}\.\d{1,8} +\d{1,3}\.\d{1,8}$/, "Koordinaten ist ung\xfcltig.");
		addHelpText(b, "Die Koordinaten dieses Knotens auf der Freifunk-Karte (z.B. \"52.02713078 8.52829987\").");
		break;
	case "name":
		b = append_input(p, "Name", id, value);
		addInputCheck(b.lastChild,/^\w+[\w\-]{0,20}\w+$/, name + " ist ung\xfcltig.");
		addHelpText(b, "Der Name dieses Knotens auf der Freifunk-Karte.");
		break;
	case "enabled":
		if(cfg == "autoupdater") {
			b = append_radio(p, "Autoupdater", id, value, [["An", "1"], ["Aus", "0"]]);
			addHelpText(b, "Der Autoupdater aktualisiert die Firmware automatisch auf die neuste Version. Dabei werden allerdings alle Einstellungen <b>zur\xfcckgesetzt</b>.");
		}
		if(cfg == "simple-tc") {
			b = append_radio(p, "Public Traffic Control", id, value, [["An", "1"], ["Aus", "0"]]);
			addHelpText(b, "Bandweitenkontrolle f\xfcr den Upload-/Download \xfcber das Freifunknetz \xfcber den eigenen Internetanschluss.");
		}
		break;
	case "limit_egress":
		b = append_input(p, "Public Upload", id, value);
		addInputCheck(b.lastChild,/^\d+$/, "Upload ist ung\xfcltig.");
		addHelpText(b, "Maximaler Upload in KBit/s f\xfcr die Bandweitenkontrolle.");
		break;
	case "limit_ingress":
		b = append_input(p, "Public Download", id, value);
		addInputCheck(b.lastChild,/^\d+$/, "Download ist ung\xfcltig.");
		addHelpText(b, "Maximaler Download in KBit/s f\xfcr die Bandweitenkontrolle.");
		break;
	case "share_internet":
		b = append_radio(p, "Gateway Modus", id, value, [["An", "yes"], ["Aus", "no"]]);
		if(!adv_mode)
			onDesc(b, "INPUT", function(e) { e.disabled = true; });
		addHelpText(b, "<b>An</b> bedeutet das der private Internetanschluss f\xfcr die \xD6ffentlichkeit freigegeben wird.<br />Die empfohlene Einstellung ist <b>Aus</b>, da es zu rechtlichen Problemen kommen kann.");
		break;
	case "config_nets":
		b = append_check(p, "SSH/HTTPS Zugriff", id, split(value), [["WAN","wan"], ["Private","private"], ["Public","public"]]);
		addHelpText(b, "Zugang zur Konfiguration \xfcber verschiedene Anschl\xfcsse/Netzwerke erm\xf6glichen.")
		break;
	case "service_link":
		b = append_input(p, "Service Link", id, value);
		addInputCheck(b.lastChild,/^[\[\] \w\/.:]{3,60}$/, "Ung\xfcltige Eingabe.");
		addHelpText(b, "Ein Verweis auf eine Netzwerkresource. Z.B. \"http://1.2.3.4\".");
		break;
	case "service_label":
		b = append_input(p, "Service Name", id, value);
		addInputCheck(b.lastChild,/^[\[\] \w\/.:]{3,30}$/, "Ung\xfcltige Eingabe.");
		addHelpText(b, "Ein Name der angegebenen Netzwerkresource. Z.B. \"Meine Webseite\".");
		break;
	case "services_display_max":
		b = append_input(p, "Max. Angezeigte-Eintr\xe4ge", id, value);
		addInputCheck(b.lastChild,/^\d+$/, "Ung\xfcltige Zahl.");
		addHelpText(b, "Maximale Anzahl der auf der Statusseite angezeigten Eintr\xe4ge.");
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
	var gfs = $("general");
	var rfs = $("resource");
	var tfs = $("traffic");

	removeChilds(gfs);
	removeChilds(rfs);
	removeChilds(tfs);

	if('freifunk' in uci) {
		var f = uci.freifunk;
		var i = firstSectionID(f, "settings");
		appendSetting(gfs, ['freifunk', i, "name"], f[i]["name"]);
		appendSetting(gfs, ['freifunk', i, "geo"], f[i]["geo"]);
		appendSetting(gfs, ['freifunk', i, "config_nets"], f[i]["config_nets"]);
		appendSetting(gfs, ['freifunk', i, "share_internet"], f[i]["share_internet"]);
		appendSetting(rfs, ['freifunk', i, "service_label"], f[i]["service_label"]);
		appendSetting(rfs, ['freifunk', i, "service_link"], f[i]["service_link"]);
		appendSetting(rfs, ['freifunk', i, "services_display_max"], f[i]["services_display_max"]);
	}

	if('autoupdater' in uci) {
		var a = uci.autoupdater;
		var i = firstSectionID(a, "autoupdater");
		appendSetting(gfs, ['autoupdater', i, "enabled"], a[i]["enabled"]);
	}

	if('simple-tc' in uci) {
		var t = uci['simple-tc'];
		var i = firstSectionID(t, "interface");
		appendSetting(tfs, ['simple-tc', i, "enabled"], t[i]["enabled"]);
		appendSetting(tfs, ['simple-tc', i, "limit_ingress"], t[i]["limit_ingress"]);
		appendSetting(tfs, ['simple-tc', i, "limit_egress"], t[i]["limit_egress"]);
	}

	var div = append(fs, "div");
}

function save_data()
{
	for(var name in uci)
	{
		var obj = uci[name];
		if(!obj.pchanged)
			continue;
		var data = toUCI(obj);
		send("/cgi-bin/misc", { func : "set_config_file", name : name, data : data },
			function(data) {
				$('msg').innerHTML = data;
				$('msg').focus();
				init();
			}
		);
	}
}
