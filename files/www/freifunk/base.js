/*
This file inserts th header and footer into every site this file is included in.
*/

function setupSite(name)
{
    $('#header').html( getHeader(name) );
    //$('#header') mark name selected
    
    for(var id in $('#globalnav').children()) {
        if(id["name"] == name)
        {
            id.className += "selected";
            break;
        }
    }
    /*
    $('#Navigation > div').click(function() {
		var name = $(this).attr("name");
		if(name == "Logout")
		{
			logout();
			return;
		}
		
		$('#Body').children().hide();
		tables[name].requestUpdate(0);
		$('#' + name).show();
		//update all visible tablest
		//obj.requestUpdate(0);
	});*/
    
    $('#footer').text( "Text for Footer");
}

function getHeader()
{
    return "<ul id='globalnav'>\
  <li><a href='info.html'>Info</a></li>\
  <li><a href='n2n.html' class='here'>N2N</a>\
    <ul>\
      <li><a href='#'>Vision</a></li>\
      <li><a href='#'>Team</a></li>\
      <li><a href='#'>Culture</a></li>\
      <li><a href='#'>Careers</a></li>\
      <li><a href='#' class='here'>History</a></li>\
      <li><a href='#'>Sponsorship</a></li>\
    </ul>\
  </li>\
 <li><a href='batman-adv.html'>Batman-Adv</a></li>\
  <li><a href='nodogsplash.html'>Nodogsplash</a></li>\
  <li><a href='firmware.html'>Firmware</a></li>\
  <li><a href='#' onClick='alert(42); return false'>Logout</a></li>\
</ul>\
<img src='logo.png' alt='some_text'/> ";
}