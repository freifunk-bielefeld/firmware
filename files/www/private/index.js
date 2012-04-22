
function nav_onclick() 
{
    setText('msg', "");
    var url = this.getAttribute("href");
    if(url == '#') return false;
    
    var id = url.substring(0, url.lastIndexOf('.'));
    
    //load html file
    jx.load(url, function(data) {
        data.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        var div = create("div");
        div.innerHTML = data;
        var e;
        onDesc(div, 'DIV', function(d) {
            if(d.id != id) return;
            e = d; return false;
        });
        
        var c = get("content");
        removeChilds(c);
        c.appendChild(e);
    },'text');
    
    //load javascript file
    jx.load(url.replace(".html", ".js"), function(data) {
        (window.execScript || function(data) {
            window[ "eval" ].call( window, data);
        })(data);
    },'text');
    
    onDesc(get("globalnav"), 'UL', function(n) { hide(n); });
    onParents(this, 'UL', function(n) { show(n); });
    onChilds(this.parentNode, 'UL', function(n) { show(n); });
    
    onDesc(get("globalnav"), 'A', function(n) { removeClass(n, "here"); });
    onParents(this, 'LI', function(n) { addClass(n.firstChild, "here"); });

    return false;
}


function init() {
    onDesc(get("globalnav"), 'UL', function(n) { hide(n); });
    onDesc(get("globalnav"), 'A', function(n) {
        if(n.getAttribute("href") != '#')
            n.onclick = nav_onclick;
    });
    
    send("/cgi-bin/misc", { func: "uname" }, function(data) {
        setText('uname', data);
    });

    send("/cgi-bin/batman-adv", { func: "get_version" }, function(data) {
        setText('batman_version', data);
    });
    
    send("/cgi-bin/n2n", { func: "get_version" }, function(data) {
        setText('n2n_version', data);
    });
    
    send("/cgi-bin/misc", { func: "uptime" }, function(data) {
        setText('uptime', data);
    });
}

function reboot() {
    if(!confirm("Reboot durchf\xFChren?")) return;
    send("/cgi-bin/misc", { func : "reboot" }, function(data) {
        setText('msg', data);
    });
}

function logout() {
    window.location="https://none@" + window.location.host;
}
