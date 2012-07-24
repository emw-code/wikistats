// Reads the current page's URL parameters and returns them as an associative array.
    var hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
	hash = hashes[i].split('=');
	if(hash[0] == 'plot' && hash[1] == '1')
		$('go_button').click()
    }
