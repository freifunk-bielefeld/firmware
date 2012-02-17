
function mark_mac_list()
{
    $(".nds_mac").each(function() {
        $(this).click(function() {
            var mac = this.textContent;
            var ul = document.getElementById('mac_list');
            var lis = ul.childNodes;
            for (i=0;i<lis.length;i++)
                if(lis[i].nodeName == "LI")
                    if(lis[i].textContent == mac)
                        return;
            var li = document.createElement('li');
            $(li).click(function() {
                ul.removeChild(this);
            });
            li.appendChild(document.createTextNode(mac));
            ul.appendChild(li);
        });
    });
}

function reload()
{
    $.post("/cgi-bin/nodogsplash", { func: "get_status" }, function(text){
        text = text.replace(/([0-9a-f]{1,2}(:[0-9a-f]{1,2}){5})/gi, "<span class='nds_mac'>$1</span>");
        document.getElementById('nds_status').innerHTML=text;
        mark_mac_list();
    });
}

function button_action(func)
{
    var macs = "";
    var ul = document.getElementById('mac_list');
    var lis = ul.childNodes;
    for (i=0;i<lis.length;i++)
        if(lis[i].nodeName == "LI")
            macs += " " + lis[i].textContent;

    if(macs.length == 0) return;
    $.post("/cgi-bin/nodogsplash", { func : func, macs : macs }, function(data) {
        $('#status').text(data);
    });
}

$('#allow_button').click(function() { button_action("allow"); });
$('#unallow_button').click(function() { button_action("unallow"); });
$('#block_button').click(function() { button_action("block"); });
$('#unblock_button').click(function() { button_action("unblock"); });
$('#auth_button').click(function() { button_action("auth"); });
$('#deauth_button').click(function() { button_action("deauth"); });


reload();
