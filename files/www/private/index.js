
function init() {
    $('#systemWorking').hide();

    $("#globalnav ul").hide();
    $('#globalnav li').click(function() {
        var url = $(this).find("> a").attr("href");
        if(url == "#") return false;
        
        var id = url.substring(0, url.lastIndexOf('.'));
        $('#content').load(url + " #" + id);
        $.getScript(url.replace(".html", ".js"));
        
        $("#globalnav ul").hide();
        $(this).parents('ul').show();
        $(this).find("> ul").show();
        
        $("#globalnav a").removeClass("here");
        $(this).parents('li').find("> a").addClass("here");
        $(this).find("> a").addClass("here");
       
        $('#status').text(""); 
        return false;
    });
    
    $('#reboot').click(function() {
      $.post("/cgi-bin/misc", { func : "reboot" }, function(data){
        if(confirm("Reboot durchfuehren?"))
            $('#status').text(data);
      })
    });
    
    $('#logout').click(function() {
        window.location="https://none@" + window.location.host;
    });
    
    $.post("/cgi-bin/misc", { func: "uname" }, function(data) {
        $('#uname').text(data);
    });

    $("fieldset input").each(function() {
        var name = "#" + this.id + "_help";
        $(this).parent().hover (
          function() { $(name).show(); },
          function() { $(name).hide(); }
        );
    });
    
    $.post("/cgi-bin/batman-adv", { func: "get_version" }, function(data) {
        $('#batman_version').text(data);
    });
    
    $.post("/cgi-bin/n2n", { func: "get_version" }, function(data) {
        $('#n2n_version').text(data);
    });
    
    $.post("/cgi-bin/misc", { func: "uptime" }, function(data) {
        $('#uptime').text(data);
    });
}

/* shared functions */

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

function getInputVal(id) {
    return document.getElementById(id).value;
}

function setInputVal(id, val) {
    document.getElementById(id).value = val;
}

function setRadioVal(name, val) {
    $("input[name="+name+"]").filter("[value="+val+"]").prop("checked",true);
}

function getRadioVal(name) {
    return $("input[name='"+name+"']:checked").val();
}

function show_error(data)
{
    var is_error = (data.substr(0, 3) == "(E)");
    if(is_error)
        $('#status').text(data);
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

//append an input field
//e.g. create_input("Name", "name_string", "MyName")
function append_input(parent, label_text, name, value)
{
    var div = document.createElement('div');
    var label = document.createElement('label');
    var input = document.createElement('input');
  
    label.innerHTML = label_text + ":";
    input.value = (typeof value == "undefined") ? "" : value;
    input.id = name;
    input.type = "text";
    
    div.appendChild(label);
    div.appendChild(input);
    
    parent.appendChild(div);
}

//append an radio field
//e.g. create_choice("Enabled", "enabled", { "Yes" : 1, "No" : 2}, 0)
function append_radio(parent, label_text, name, choices, selected)
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
