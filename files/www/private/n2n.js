$.post("/cgi-bin/n2n", { func: "get_config" }, function(data){
    $('#text').text(data);
    //var obj = jQuery.parseJSON(data);
    /*
    $(document.createElement('div'))
    IP: <input type="text" id="ip"></input>
    supernode: <input type="text"id=""></input>
    port: <input type="text"id=""></input>
    community: <input type="text"id=""></input>
    key: <input type="text"id=""></input>
    route: <input type="text"id=""></input>
    
    document.getElementById('#config').innerhtml="":
    */
});