
function send(obj) {
    $.post("/cgi-bin/tinc", obj, function(data) {
        $('#msg').text(data); 
    });
}

function get_onclick(nn, hn) {
    return function() {
        $('#msg').text('');
        update_net(nn);
        update_host(hn);
    };
}

function update_host(hn)
{
    var fs = document.getElementById("host");
    removeChildsBut(fs, "LEGEND");
    get("host_name").innerHTML = hn;
    if(hn.length == 0) return;
    
    $.post("/cgi-bin/tinc", { func: "get_host", host_name : hn}, function(data) {
        if(show_error(data)) return;
        var obj = jQuery.parseJSON(data);
        
        appendSettings(fs, hn, obj);
    });
}

function update_net(nn)
{
    var fs = document.getElementById("net");
    removeChildsBut(fs, "LEGEND");
    get("net_name").innerHTML = nn;
    
    if(nn.length == 0) return;
    
    $.post("/cgi-bin/tinc", { func: "get_net", net_name : nn }, function(data) {
        if(show_error(data)) return;
        var obj = jQuery.parseJSON(data);
        
        appendSettings(fs, nn, obj);
    });
}

//setting => label
var ttable = { "enabled" : "Aktiv", "name" : "Host Name", "net" : "Netz", "Address" : "Adresse", "generate_keys" : "Schlüssel generieren", "ConnectTo" : "Verbinden zu"};
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
        var name = setting;
        if(setting == "enabled" || setting == "generate_keys") {
            append_radio(parent, label, name, value, {"Ja":1, "Nein":0});
        } else {
            append_input(parent, label, name, value);
        }
    }
}

function parse_list(data)
{
    var nets = jQuery.parseJSON(data);
    var ul = document.getElementById('data');
    removeChilds(ul);
    
    function makeList(nn, host_list)
    {
        var ul = document.createElement('ul');
        var hosts = host_list.split(" ");
        
        for(var i in hosts)
        {
            if(hosts[i].length == 0)
                continue;
            
            var hn = hosts[i];
            var li = document.createElement('li');
            var a = document.createElement('a');
            
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
        
        var li = document.createElement('li');
        var a = document.createElement('a');
        var div = document.createElement('div');
        
        a.innerHTML="Netz: '"+nn+"'";
        a.onclick = get_onclick(nn, "");
        
        li.appendChild(a);
        li.appendChild(makeList(nn, host_list));
        
        ul.appendChild(li);
    }
}

function get_net_name() {
    var c = get("net_name").firstChild;
    return (c === null) ? "" : c.nodeValue;
}

function get_host_name() {
    var c = get("host_name").firstChild;
    return (c === null) ? "" : c.nodeValue;
}

function save_net() {
    var nn = get_net_name();
    var obj = { func : "set_net", net_name : nn };
    collect_inputs(get("net"), obj, nn+"_");
    send(obj);
}

function save_host() {
    var hn = get_host_name();
    var obj = { func : "set_host", host_name : hn };
    collect_inputs(get("host"), obj, hn+"_");
    send(obj);
}

function delete_net() {
    if(confirm("Netz wirklich Loeschen?\nAlle zugehörigen Host-Schlüssel werden geschlöscht!"))
        send_rebuild( { func : "del_net", net_name : get_net_name() });
}

function delete_host() {
    if(confirm("Host wirklich Loeschen?"))
        send({ func : "del_host", net_name : get_net_name(), host_name : get_host_name() });
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
    var obj = {}; collect_inputs(get("net"), obj); //hackish
    export_key(get_net_name(), obj.Name);
}

function export_host_key() {
    export_key(get_net_name(), get_host_name());
}

function add_net() {
    var net_name = get("new_net_name").value;
    send({ func : "add_net", net_name : net_name });
    rebuild_list();
}

function rebuild_list() {
    $.post("/cgi-bin/tinc", { func: "get_net_list" }, parse_list);
}

rebuild_list();

