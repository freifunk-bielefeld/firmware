
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
       
        $('#msg').text(""); 
        return false;
    });
    
    $('#reboot').click(function() {
      $.post("/cgi-bin/misc", { func : "reboot" }, function(data){
        if(confirm("Reboot durchfuehren?"))
            $('#msg').text(data);
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
