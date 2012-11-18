
var mac_regex = /([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gi;

function get(id) { return document.getElementById(id); }
function create(name) { return document.createElement(name); }
function show(e) { e.style.display='block'; }
function hide(e) { e.style.display='none'; }
function addClass(e, c) { e.classList.add(c); } //HTML5!
function removeClass(e, c) { e.classList.remove(c); }
function setText(id, txt) { get(id).innerHTML = txt; }
function inArray(item, array) { return array.indexOf(item) != -1; }

function split(str)
{
    if(typeof str != 'string')
        return [];
    var a = str.match(/[^\s]+/g);                                 
    return (a ? a : []);
}

function uniq(arr)
{
  var obj = {};
  for(var i in arr) obj[arr[i]] = 0;
  return Object.keys(obj);
}

function parseJSON(data)
{
    data = data.replace(/[\n\r]/g, ""); //for IE
    return eval("("+data+")");
}

function parseUCI(str)
{
    var obj = {};
    function add(pkg, sec, opt, val)
    {
        if(!(pkg in obj)) obj[pkg] = {};
        if(!(sec in obj[pkg])) obj[pkg][sec] = {};
        obj[pkg][sec][opt] = val;
    };
    
    var lines = str.split("\n");
    for(var i = 0; i < lines.length; ++i)
    {
        var line = lines[i];
        var pos = line.indexOf('=');
        if(pos < 1) continue;
        var path=line.substring(0, pos);
        var value = line.substring(pos + 1);
        var parts = path.split('.');
        add(parts[0], parts[1], (parts.length == 3) ? parts[2] : "stype", value);
    }
    return obj;
}

function config_foreach(objs, stype, func)
{
    for(var key in objs)
    {
        var obj = objs[key];
        if(obj["stype"] == stype)
            func(key, obj);
    }
}

function params(obj)
{
    var str = "";
    for(var key in obj) {
        if(str.length) str += "&";
        else str += "?";
        str += encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
    }
    return str.replace(/%20/g, "+");
}

function send(url, obj, func)
{
    url += params(obj);
    jx.load(url, func, 'text');
}

function onDesc(e, tag, func)
{
    for(var i = 0; i < e.childNodes.length; ++i) {
        var c = e.childNodes[i];
        if(c.tagName == tag && func(c) == false) return;
        onDesc(c, tag, func);
    }
}

function onChilds(e, tag, func)
{
    for(var i = 0; i < e.childNodes.length; ++i) {
        var c = e.childNodes[i];
        if(c.tagName == tag && func(c) == false) return;
    }
}

function onParents(e, tag, func)
{
    while(e != document) {
        e = e.parentNode;
        if(e.tagName == tag && func(e) == false) return;
    }
}

function removeChilds(p)
{
    while(p.hasChildNodes())
        p.removeChild(p.firstChild);
}

function show_error(data)
{
    var is_error = (data.substr(0, 3) == "(E)");
    if(is_error)
        setText('msg', data);
    return is_error;
}

function collect_inputs(p, obj)
{
    if(p.tagName == "SELECT")
        obj[p.name] = p.value;
    if(p.tagName == "INPUT")
        if(p.type == "text" || (p.type == "radio" && p.checked))
            obj[p.name] = p.value
        else if(p.type == "checkbox" && p.checked)
        {
            var v = obj[p.name];
            v = (typeof v == "undefined") ? p.value : (v + " " + p.value);
            obj[p.name] = v;
        }
    
    for(var i = 0; i < p.childNodes.length; ++i)
        collect_inputs(p.childNodes[i], obj);
}

function append(parent, tag)
{
    var e = create(tag);
    parent.appendChild(e);
    return e;
}

function append_section(parent, title, id)
{
    var fs = append(parent, "fieldset");
    var lg = create("legend");
    lg.innerHTML = title;
    if(id) fs.id = id;
    fs.appendChild(lg);
    return fs;
}

function append_button(parent, text, onclick)
{
    var button = append(parent, 'button');
    button.type = 'button';
    button.innerHTML = text;
    button.onclick = onclick;
    return button;
}

function append_label(parent, title, value)
{
    var div = append(parent, 'div');
    var label = create('label');
    var span = create('span');

    label.innerHTML = title + ":";
    span.innerHTML = value;

    div.appendChild(label);
    div.appendChild(span);

    return div;
}

function append_selection(parent, title, name, selected, choices)
{
    var p = append(parent, 'div');
    var label = create('label');
    var select = create('select');

    select.style.minWidth = "5em"; 
    select.name = name;
    p.className = "radio";
    label.innerHTML = title + ":";
    p.appendChild(label);
    p.appendChild(select);

    for(var i in choices)
    {
        var s = (typeof choices[i] != 'object');
        var choice_text = " " + (s ? choices[i] : choices[i][0]);
        var choice_value = "" + (s ? choices[i] : choices[i][1]);

        var option = append(select, 'option');
        option.value = choice_value;
        option.selected = (choice_value == selected) ? "selected" : "";
        option.innerHTML= choice_text;
    }
    return p;
}

//append an input field
//e.g. append_input(parent, "Name", "name_string", "MyName")
function append_input(parent, title, name, value)
{
    var div = append(parent, 'div');
    var label = create('label');
    var input = create('input');
  
    label.innerHTML = title + ":";
    input.value = (typeof value == "undefined") ? "" : value;
    input.name = name;
    input.type = "text";
    
    div.appendChild(label);
    div.appendChild(input);
    
    return div;
}

//append a radio field
//e.g. append_radio(parent, "Enabled", "enabled", 0, [["Yes", 1], ["No", 0])
function append_radio(parent, title, name, selected, choices) {
    return _selection("radio", parent, title, name, [selected], choices);
}

//append a checkbox field
//e.g. append_check(parent, "Enabled", "enabled", ["grass"], [["Grass", "grass"], ["Butter", "butter"]])
function append_check(parent, title, name, selected, choices) {
    return _selection("checkbox", parent, title, name, selected, choices);
}

function _selection(type, parent, title, name, selected, choices)
{
    var p = append(parent, 'div');
    var label = create('label');
    
    p.className = "radio";
    label.innerHTML = title + ":";
    p.appendChild(label);
    
    for (var i in choices)
    {
        var s = (typeof choices[i] == 'string');
        var choice_text = " " + (s ? choices[i] : choices[i][0]);
        var choice_value = "" + (s ? choices[i] : choices[i][1]);
        
        var div = append(p, 'div');
        var input = create('input');
        var label = create('label');
        
        input.name = name;
        input.value = choice_value;
        input.type = type;
        if(inArray(choice_value, selected))
            input.checked = "checked"
        
        label.innerHTML = " " + choice_text;
        
        div.appendChild(input);
        div.appendChild(label);
    }
    return p;
}

//from jx_compressed.js
jx={getHTTPObject:function(){var A=false;if(typeof ActiveXObject!="undefined"){try{A=new ActiveXObject("Msxml2.XMLHTTP")}catch(C){try{A=new ActiveXObject("Microsoft.XMLHTTP")}catch(B){A=false}}}else{if(window.XMLHttpRequest){try{A=new XMLHttpRequest()}catch(C){A=false}}}return A},load:function(url,callback,format){var http=this.init();if(!http||!url){return }if(http.overrideMimeType){http.overrideMimeType("text/xml")}if(!format){var format="text"}format=format.toLowerCase();var now="uid="+new Date().getTime();url+=(url.indexOf("?")+1)?"&":"?";url+=now;http.open("GET",url,true);http.onreadystatechange=function(){if(http.readyState==4){if(http.status==200){var result="";if(http.responseText){result=http.responseText}if(format.charAt(0)=="j"){result=result.replace(/[\n\r]/g,"");result=eval("("+result+")")}if(callback){callback(result)}}else{if(error){error(http.status)}}}};http.send(null)},init:function(){return this.getHTTPObject()}}
