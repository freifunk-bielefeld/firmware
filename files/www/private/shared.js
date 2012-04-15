
function getParentId(elem) {
  if(elem == document)
    alert("(E) tinc.js: document root reached");

  var id = elem.parentNode.id;
  if(id) { return id; } else { return getParentId(elem.parentNode); }
}

function get(id) {
    return document.getElementById(id);
}

function create(name) {
    return document.getElementById(name);
}

function removeChilds(p) {
    while(p.hasChildNodes())
        p.removeChild(p.firstChild);
}

function removeChildsBut(p, name) {
    var s;
    while(p.hasChildNodes()) {
        var n = p.removeChild(p.firstChild);
        if(n.tagName == name)
            s = n;
    }
    if(typeof s != 'undefined')
        p.appendChild(s);
}

function show_error(data)
{
    var is_error = (data.substr(0, 3) == "(E)");
    if(is_error)
        $('#msg').text(data);
    return is_error;
}

function append_button(parent, text, onclick)
{
    var button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = text;
    button.onclick = onclick;
    parent.appendChild(button);
}

function collect_inputs(p, obj)
{
    if(p.tagName == "INPUT")
        if(p.type == "text" || (p.type == "radio" && p.checked))
            obj[p.name] = p.value
    
    for(var i = 0; i < p.childNodes.length; ++i)
        collect_inputs(p.childNodes[i], obj);
}

//append an input field
//e.g. create_input("Name", "name_string", "MyName")
function append_input(parent, label_text, name, value)
{
    var div = document.createElement('div');
    var label = document.createElement('label');
    var input = document.createElement('input');
  
    label.innerHTML = label_text + ":";
    input.value = (typeof value == "undefined") ? "" : value;
    input.name = name;
    input.type = "text";
    
    div.appendChild(label);
    div.appendChild(input);
    
    parent.appendChild(div);
}

//append an radio field
//e.g. create_choice("Enabled", "enabled", 0, { "Yes" : 1, "No" : 2})
function append_radio(parent, label_text, name, selected, choices)
{
    var p = document.createElement('div');
    var label = document.createElement('label');

    p.className="radio";
    label.innerHTML = label_text + ":";
    p.appendChild(label);
    
    for (var id in choices)
    {
        var choice_text = " " + id
        var choice_value = choices[id];
        
        var div = document.createElement('div');
        var input = document.createElement('input');
        var label = document.createElement('label');
        
        input.name = name;
        input.value = choice_value;
        input.type = "radio";
        if(choice_value == selected)                                 
            input.checked = "checked"
        
        label.innerHTML = " " + choice_text;
        
        div.appendChild(input);
        div.appendChild(label);
        p.appendChild(div);
    }
    
    parent.appendChild(p);
}
