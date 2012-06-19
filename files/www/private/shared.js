
var mac_regex = /([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gi;

function get(id) { return document.getElementById(id); }
function create(name) { return document.createElement(name); }
function show(e) { e.style.display='block'; }
function hide(e) { e.style.display='none'; }
function addClass(e, c) { e.classList.add(c); } //HTML5!
function removeClass(e, c) { e.classList.remove(c); }
function setText(id, txt) { get(id).innerHTML = txt; }
function split(str) { return str.match(/[^ ]+/g); }

function parseJSON(data)
{
    data = data.replace(/[\n\r]/g, ""); //for IE
    return eval("("+data+")");
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

function inArray(item, array) {
    for(var i = 0; i < array.length; i++)
        if(array[i] == item) return true;
    return false;
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

function append_button(parent, text, onclick)
{
    var button = create('button');
    button.type = 'button';
    button.innerHTML = text;
    button.onclick = onclick;
    parent.appendChild(button);
    return button;
}

//append an input field
//e.g. append_input(parent, "Name", "name_string", "MyName")
function append_input(parent, label_text, name, value)
{
    var div = create('div');
    var label = create('label');
    var input = create('input');
  
    label.innerHTML = label_text + ":";
    input.value = (typeof value == "undefined") ? "" : value;
    input.name = name;
    input.type = "text";
    
    div.appendChild(label);
    div.appendChild(input);
    
    parent.appendChild(div);
    return input;
}

//append a radio field
//e.g. append_radio(parent, "Enabled", "enabled", 0, { "Yes" : 1, "No" : 0})
function append_radio(parent, label_text, name, selected, choices) {
    return append_selection("radio", parent, label_text, name, [selected], choices);
}

//append a checkbox field
//e.g. append_check(parent, "Enabled", "enabled", ["grass"], { "Grass" : "grass", "Butter" : "butter"})
function append_check(parent, label_text, name, selected, choices) {
    return append_selection("checkbox", parent, label_text, name, selected, choices);
}

function append_selection(type, parent, label_text, name, selected, choices)
{
    var p = create('div');
    var label = create('label');
    
    p.className = "radio";
    label.innerHTML = label_text + ":";
    p.appendChild(label);
    
    for (var id in choices)
    {
        var choice_text = " " + id;
        var choice_value = choices[id];
        
        var div = create('div');
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
        p.appendChild(div);
    }
    
    parent.appendChild(p);
    return p;
}

//from jx_compressed.js
jx={getHTTPObject:function(){var A=false;if(typeof ActiveXObject!="undefined"){try{A=new ActiveXObject("Msxml2.XMLHTTP")}catch(C){try{A=new ActiveXObject("Microsoft.XMLHTTP")}catch(B){A=false}}}else{if(window.XMLHttpRequest){try{A=new XMLHttpRequest()}catch(C){A=false}}}return A},load:function(url,callback,format){var http=this.init();if(!http||!url){return }if(http.overrideMimeType){http.overrideMimeType("text/xml")}if(!format){var format="text"}format=format.toLowerCase();var now="uid="+new Date().getTime();url+=(url.indexOf("?")+1)?"&":"?";url+=now;http.open("GET",url,true);http.onreadystatechange=function(){if(http.readyState==4){if(http.status==200){var result="";if(http.responseText){result=http.responseText}if(format.charAt(0)=="j"){result=result.replace(/[\n\r]/g,"");result=eval("("+result+")")}if(callback){callback(result)}}else{if(error){error(http.status)}}}};http.send(null)},init:function(){return this.getHTTPObject()}}
