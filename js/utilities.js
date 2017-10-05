// Converts unformatted integers (e.g. 10000) to more easily-readable strings (e.g. 10,000)
function comma(number) {
	// Cast 'number' to string
	number = '' + number;
	
	// If number is at least 1000, then do some processing
	if (number.length > 3) {
		// Determines how much larger than nearest thousand, million, billion (etc.) current number is
		// e.g. for '10000', mod = 2 
		var mod = number.length % 3;
		
		// If mod > 0, then set 'output' to characters between number[0] and  number[mod]  
		// -- otherwise, set 'output' to empty string.
		// For 10000, 'output' here is 10.
		var output = (mod > 0 ? (number.substring(0,mod)) : '');
		
		// The snippet 'Math.floor(number.length / 3)' gives the floored, base-1000 logarithm of the input number
		// For 10000000, this would be 2
		for (var i = 0 ; i < Math.floor(number.length / 3); i++) {
			if ((mod == 0) && (i == 0)){
				output += number.substring(mod + 3 * i, mod + 3 * i + 3);
			} else {
				output+= ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
			}
		}
		return (output);
	}
	else return number;
}

/* Adds behavior for button elements
*  The main behaviors are:
* 	- Hovering over with mouse: this should shade the button being hovered over.
*	- Clicking the + (Add page) or - (Remove page) buttons should add or remove a 'Page' input field
*		- If there is only one 'Page' input, remove the "-" button
*		- If there are three 'Page' inputs, we've reached our limit, so remove the "+" button
*	 	- Change the label to 'Page' or 'Pages' based on how many 'Page' inputs currently exist
*	- 
*/
$(function () {

	var page_input_size = '30';
	if (navigator.appName == 'Microsoft Internet Explorer'){
		$('input .page').attr('size', '28');
		page_input_size = '28';
	}
	
	// Adds shading to buttons upon hovering over
	$('button').hover(
		function(){ 
			$(this).addClass("ui-state-hover"); 
		},
		function(){ 
			$(this).removeClass("ui-state-hover"); 
		}
	)

	$('#go_button').removeAttr("disabled");
		
		// This blocks adds behavior for the 'Add page' (+) and 'Subtract page' (-) button behavior
	// $('.page').length returns the number of 'page' inputs upon document.ready
	var current_num_pages = $('.page').length
	var current_num_projects = $('.project').length
		
	// This block lets us deal with 'Page' inputs that have values filled in from URL params upon page load
	if (current_num_pages == 2 || current_num_pages == 3){
		$("#subtract_page").show();
		$("#page_label").html("Pages");
		$("#p1").css({ "left": "3px", "margin-right": "-1px"});
		$("#subtract_page").css({ "margin-left": "4px"});
		
		// We don't allow the user to have more than 3 pages, so remove the '+' button
		if (current_num_pages == 3)
			$('#add_page').hide();
	}


	$('#add_page').click(function(){
		current_num_pages++;
		
		if (current_num_pages == 2){
			$("#subtract_page").show();
			$("#page_label").html("Pages");
			$("#p1").css({"left": "3px", "margin-right": "3px"});
			$('#add_project').hide();
		}
		
		if (current_num_pages== 3){
			$('#add_page').hide();
		}
		
		var strToAdd = '<input class="dataSeries page" type="text" size="' + page_input_size + '" id="p' + current_num_pages + '" name="p' + current_num_pages + '"/>'

		$(strToAdd).insertAfter('#p' + (current_num_pages -1) + '');
	});

	$('#subtract_page').click(function(){
		//current keeps track of how many pages we have.
		current_num_pages--
		
		if (current_num_pages == 1){
			$("#page_label").html("Page");
			$("#p1").css({ "left": "11px", "margin-right": "11px"});
			$("#subtract_page").hide();
			$('#add_project').show();
		}
		
		if (current_num_pages == 2){
			$('#add_page').show()
		}
		
		$('#p' + (current_num_pages + 1)).remove();
	});
	
	$('#add_project').click(function(){
		current_num_projects++;
		
		if (current_num_projects == 2){
			$("#subtract_project").show();
			$("#project_label").html("Projects");
			$("#project1").css({ "left": "3px", "margin-right": "3px"});
			$('#add_page').hide();
		}
		
		if (current_num_projects == 3 || $('#project3').html() != null){
			//console.log($('#project3').html());
			//console.log($('#project3').html()  != null);
			$('#add_project').hide();
			$("#subtract_project").show();
		}
		
		var options = '<option value="en">English</option><option value="de" >German</option><option value="fr" >French</option><option value="pl" >Polish</option><option value="ja" >Japanese</option><option value="it" >Italian</option><option value="nl" >Dutch</option><option value="pt" >Portuguese</option><option value="es" >Spanish</option><option value="sv" >Swedish</option><option value="ru" >Russian</option><option value="zh" >Chinese</option><option value="zh-classical" >Chinese (classical)</option><option value="no" >Norwegian</option><option value="fi" >Finnish</option><option value="vo" >Volap�k</option><option value="ca" >Catalan</option><option value="ro" >Romanian</option><option value="tr" >Turkish</option><option value="uk" >Ukrainian</option><option value="eo" >Esperanto</option><option value="cs" >Czech</option><option value="hu" >Hungarian</option><option value="sk" >Slovak</option><option value="da" >Danish</option><option value="id" >Indonesian</option><option value="he" >Hebrew</option><option value="lt" >Lithuanian</option><option value="sr" >Serbian</option><option value="sl" >Slovenian</option><option value="ar" >Arabic</option><option value="ko" >Korean</option><option value="bg" >Bulgarian</option><option value="et" >Estonian</option><option value="new" >Newar / Nepal Bhasa</option><option value="hr" >Croatian</option><option value="te" >Telugu</option><option value="ceb" >Cebuano</option><option value="gl" >Galician</option><option value="th" >Thai</option><option value="el" >Greek</option><option value="fa" >Persian</option><option value="vi" >Vietnamese</option><option value="nn" >Norwegian (Nynorsk)</option><option value="ms" >Malay</option><option value="simple" >Simple English</option><option value="eu" >Basque</option><option value="bpy" >Bishnupriya Manipuri</option><option value="bs" >Bosnian</option><option value="lb" >Luxembourgish</option><option value="ka" >Georgian</option><option value="is" >Icelandic</option><option value="sq" >Albanian</option><option value="br" >Breton</option><option value="la" >Latin</option><option value="az" >Azeri</option><option value="bn" >Bengali</option><option value="hi" >Hindi</option><option value="mr" >Marathi</option><option value="tl" >Tagalog</option><option value="mk" >Macedonian</option><option value="sh" >Serbo-Croatian</option><option value="io" >Ido</option><option value="cy" >Welsh</option><option value="pms" >Piedmontese</option><option value="su" >Sundanese</option><option value="lv" >Latvian</option><option value="ta" >Tamil</option><option value="nap" >Neapolitan</option><option value="jv" >Javanese</option><option value="ht" >Haitian</option><option value="nds" >Low Saxon</option><option value="scn" >Sicilian</option><option value="oc" >Occitan</option><option value="ast" >Asturian</option><option value="ku" >Kurdish</option><option value="hy" >Armenian</option><option value="af" >Afrikaans</option><option value="commons.m" >Commons</option><option value="meta.m">Meta</option></select>';
		
		var previousSelectedProjects = {};
		
		$.each($('[id^="project"] option'), function(){
			option = $(this);
			if (option.attr('selected')) {
				//console.log(option.val());
				previousSelectedProjects[option.val()] = "1";
			}
		});
		
		var strToAdd = '<select class="dataSeries project" id="project' + current_num_projects + '" name="project' + current_num_projects + '">' + options + '</select>';
		
		$(strToAdd).insertAfter('#project' + (current_num_projects -1));	
		
		
		$.each($('#project' + current_num_projects + ' option'), function(){
			if ($(this).val() in previousSelectedProjects) $(this).remove();
		});
	});

	$('#subtract_project').click(function(){
		//current keeps track of how many projects we have.
		current_num_projects--
		
		if (current_num_projects == 1){
			$("#project_label").html("Project");
			$("#p1").css({ "left": "11px", "margin-right": "11px"});
			$("#subtract_project").hide();
			$('#add_page').show();
		}
		
		if (current_num_projects == 2){
			$('#add_project').show()
		}
		
		$('#project' + (current_num_projects + 1)).remove();
	});
	
	// Captures user pressing 'Enter' key and triggers plotting
	$(window).keyup(function(e) {
		if(e.keyCode == 13) {
			$('#go_button').click()
		}
	});
});


// JSON utility functions 
// from http://code.google.com/p/jquery-json/
(function($){$.toJSON=function(o)
{if(typeof(JSON)=='object'&&JSON.stringify)
return JSON.stringify(o);var type=typeof(o);if(o===null)
return"null";if(type=="undefined")
return undefined;if(type=="number"||type=="boolean")
return o+"";if(type=="string")
return $.quoteString(o);if(type=='object')
{if(typeof o.toJSON=="function")
return $.toJSON(o.toJSON());if(o.constructor===Date)
{var month=o.getUTCMonth()+1;if(month<10)month='0'+month;var day=o.getUTCDate();if(day<10)day='0'+day;var year=o.getUTCFullYear();var hours=o.getUTCHours();if(hours<10)hours='0'+hours;var minutes=o.getUTCMinutes();if(minutes<10)minutes='0'+minutes;var seconds=o.getUTCSeconds();if(seconds<10)seconds='0'+seconds;var milli=o.getUTCMilliseconds();if(milli<100)milli='0'+milli;if(milli<10)milli='0'+milli;return'"'+year+'-'+month+'-'+day+'T'+
hours+':'+minutes+':'+seconds+'.'+milli+'Z"';}
if(o.constructor===Array)
{var ret=[];for(var i=0;i<o.length;i++)
ret.push($.toJSON(o[i])||"null");return"["+ret.join(",")+"]";}
var pairs=[];for(var k in o){var name;var type=typeof k;if(type=="number")
name='"'+k+'"';else if(type=="string")
name=$.quoteString(k);else
continue;if(typeof o[k]=="function")
continue;var val=$.toJSON(o[k]);pairs.push(name+":"+val);}
return"{"+pairs.join(", ")+"}";}};$.evalJSON=function(src)
{if(typeof(JSON)=='object'&&JSON.parse)
return JSON.parse(src);return eval("("+src+")");};$.secureEvalJSON=function(src)
{if(typeof(JSON)=='object'&&JSON.parse)
return JSON.parse(src);var filtered=src;filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');if(/^[\],:{}\s]*$/.test(filtered))
return eval("("+src+")");else
throw new SyntaxError("Error parsing JSON, source is not valid.");};$.quoteString=function(string)
{if(string.match(_escapeable))
{return'"'+string.replace(_escapeable,function(a)
{var c=_meta[a];if(typeof c==='string')return c;c=a.charCodeAt();return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);})+'"';}
return'"'+string+'"';};var _escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;var _meta={'\b':'\\b','\t':'\\t','\n':'\\n','\f':'\\f','\r':'\\r','"':'\\"','\\':'\\\\'};})(jQuery);
