
function mysend(obj) {
    send("/cgi-bin/tinc", obj, function(data) {
        setText("msg", data);
    });
}

function get_onclick(nn, hn) {
    return function() {
        setText("msg", "");
        
        hide(get("host_div"));
        hide(get("net_div"));
        
        onDesc(get("data"), 'A', function(n) { removeClass(n, "selected"); });
        
        addClass(this, "selected");
        
        setText("net_name", nn);
        setText("host_name", hn);
        
        if(hn.length == 0)
        {
            update_net(nn);
            show(get("net_div"));
        }
        else
        {
            update_host(hn);
            show(get("host_div"));
        }
    };
}

function update_net(nn)
{
    var fs = get("net_fs");
    removeChildsBut(fs, "LEGEND");
    
    send("/cgi-bin/tinc", { func: "get_net", net_name : nn }, function(data) {
        if(show_error(data)) return;
        var obj = parseJSON(data);
        appendSettings(fs, nn, obj);
    });
}

function update_host(hn)
{
    var fs = get("host_fs");
    removeChildsBut(fs, "LEGEND");
    
    send("/cgi-bin/tinc", { func: "get_host", host_name : hn}, function(data) {
        if(show_error(data)) return;
        var obj = parseJSON(data);
        appendSettings(fs, hn, obj);
    });
}

//setting => label
var ttable = { "enabled" : "Aktiv", "name" : "Host Name", "net" : "Netz", "Address" : "Adresse", "generate_keys" : "Schl\xFCssel generieren", "ConnectTo" : "Verbinden zu"};
function getLabel(name)
{
    var label = ttable[name];
    return (typeof label == "undefined") ? name : label;
}

function appendSettings(parent, n, obj)
{
    for(var setting in obj)
    {
        var label = getLabel(setting);
        var value = obj[setting];
        var name = n+"_"+setting;
        if(setting == "enabled" || setting == "generate_keys") {
            append_radio(parent, label, name, value, {"Ja":1, "Nein":0});
        } else {
            append_input(parent, label, name, value);
        }
    }
}

function rebuild_list() {
    hide(get("host_div"));
    hide(get("net_div"));

    send("/cgi-bin/tinc", { func: "get_net_list" }, parse_list);
}

function parse_list(data)
{
    var nets = parseJSON(data);
    var ul = get('data');
    removeChilds(ul);
    
    function makeList(nn, host_list)
    {
        var ul = create('ul');
        var hosts = host_list.split(" ");
        
        for(var i in hosts)
        {
            if(hosts[i].length == 0)
                continue;
            
            var hn = hosts[i];
            var li = create('li');
            var a = create('a');
            
            a.innerHTML="Host: '"+hn+"'";
            a.onclick = get_onclick(nn, hn);
            
            li.appendChild(a);
            ul.appendChild(li);
       }
       
       return ul;
    }
    
    for(var nn in nets)
    {
        var host_list = nets[nn];
        
        var li = create('li');
        var a = create('a');
        var div = create('div');
        
        a.innerHTML="Netz: '"+nn+"'";
        a.onclick = get_onclick(nn, "");
        
        li.appendChild(a);
        li.appendChild(makeList(nn, host_list));
        
        ul.appendChild(li);
    }
}

function get_net_name() {
    return get("net_name").firstChild.nodeValue;
}

function get_host_name() {
    return get("host_name").firstChild.nodeValue;
}

function save_net() {
    var nn = get_net_name();
    var obj = { func : "set_net", net_name : nn };
    collect_inputs(get("net_fs"), obj);
    mysend(obj);
}

function save_host() {
    var hn = get_host_name();
    var obj = { func : "set_host", host_name : hn };
    collect_inputs(get("host_fs"), obj);
    mysend(obj);
}

function delete_net() {
    if(confirm("Netz wirklich L\xF6schen?\nAlle zugeh\xF6rigen Host-Schl\xFCssel werden geschl\xF6scht!")) {
        mysend( { func : "del_net", net_name : get_net_name() });
        rebuild_list();
    }
}

function delete_host() {
    if(confirm("Host wirklich L\xF6schen?")) {
        mysend({ func : "del_host", net_name : get_net_name(), host_name : get_host_name() });
        rebuild_list();
    }
}

function import_key() {
    get("uf_net_name").value = get_net_name();
    get("uf").submit();
}

function export_key(net_name, key_name) {
    get("df_net_name").value = net_name;
    get("df_key_name").value = key_name;
    get("df").submit();
 }

function export_net_key() {
    var obj = {}; collect_inputs(get("net_fs"), obj); //hackish
    var nn = get_net_name();
    var kn = obj[nn+"_Name"];
    if(typeof kn == 'undefined')
        alert("Schl\xFCsselname is unbekannt.");
    export_key(nn, kn);
}

function export_host_key() {
    export_key(get_net_name(), get_host_name());
}

function add_net() {
    var net_name = get("new_net_name").value;
    get("new_net_name").value = "";
    mysend({ func : "add_net", net_name : net_name });
    rebuild_list();
}

rebuild_list();
