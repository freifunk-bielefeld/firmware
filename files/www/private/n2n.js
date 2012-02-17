
function getParentId(elem) {
  if(elem == document)
    alert("(E) n2n.js: document root reached");

  var id = elem.parentNode.id;
  if(id) { return id; } else { return getParentId(elem.parentNode); }
}

function get(id) {
    return document.getElementById(id).value;
}

function removeChilds(p) {
  while(p.hasChildNodes()) {
    p.removeChild(p.firstChild);
  }
}

function parse_config(data) {
    var objs = jQuery.parseJSON(data);
    var p = document.getElementById('data');
    
    removeChilds(p);
    
    for (var id in objs)
    {
        var obj = objs[id];
        
        var fieldset = document.createElement('fieldset');
        var legend = document.createElement('legend');
        var span = document.createElement('span');
        
        span.appendChild(document.createTextNode("Verbindung " + id.replace("entry_", "")));
        legend.appendChild(span);
        fieldset.appendChild(legend);
        
        //delete button
        var del_button = document.createElement('button');
        del_button.type = 'button';
        del_button.appendChild(document.createTextNode('Loeschen'));
        del_button.onclick = function() {
            //var id = getParentId(this);
            if(confirm("Eintrag wirklich Loeschen?"))
            {
                $.post("/cgi-bin/n2n", { func : "del_config", id : id }, function(data){
                    $('#status').text(data);
                    rebuild_config();
                });
            }
        }
        
        //save button
        var set_button = document.createElement('button');
        set_button.type = 'button';
        set_button.appendChild(document.createTextNode('Speichern'));
        set_button.onclick = function() {
            //var id = getParentId(this);
            $.post("/cgi-bin/n2n",
                { func : "set_config", id : id,
                supernode : get(id + "_supernode"),
                port : get(id + "_port"),
                community : get(id + "_community"),
                key : get(id + "_key"),
                function(data) { $('#status').text(data); }
            );
        }

        function add(label_text, name)
        {
            var div = document.createElement('div');
            var label = document.createElement('label');
            var input = document.createElement('input');
          
            label.appendChild(document.createTextNode(label_text + ":"));
            
            input.value = obj[name];
            input.id = id + "_" + name;
            input.type = "text";
            
            div.appendChild(label);
            div.appendChild(input);
            
            fieldset.appendChild(div);
        }

        add("Supernode", "supernode");
        add("Port", "port");
        add("Community", "community");
        add("Key", "key");
        
        var div = document.createElement('div');
        div.appendChild(del_button);
        div.appendChild(set_button);
        
        fieldset.appendChild(div);
        p.appendChild(fieldset);
    }
}

$('#add_button').click(function() {
    $.post("/cgi-bin/n2n", { func : "add_config" }, function(data) {
        $('#status').text(data);
        rebuild_config();
    });
});

$('#apply_button').click(function() {
    $.post("/cgi-bin/n2n", { func : "apply_config" }, function(data) {
        $('#status').text(data);
    });
});

$('#save_button').click(function() {
    $.post("/cgi-bin/n2n", { func : "save_config" }, function(data) {
        $('#status').text(data);
        rebuild_config();
    });
});

function rebuild_config() {
    $.post("/cgi-bin/n2n", { func: "get_config" }, parse_config);
}

rebuild_config();
