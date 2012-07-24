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

	page_input_size = '30'
	if (navigator.appName == 'Microsoft Internet Explorer'){
		$('input .page').attr('size', '28');
		page_input_size = '28'
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
		
		var options = '<option value="en">English</option><option value="de" >German</option><option value="fr" >French</option><option value="pl" >Polish</option><option value="ja" >Japanese</option><option value="it" >Italian</option><option value="nl" >Dutch</option><option value="pt" >Portuguese</option><option value="es" >Spanish</option><option value="sv" >Swedish</option><option value="ru" >Russian</option><option value="zh" >Chinese</option><option value="zh-classical" >Chinese (classical)</option><option value="no" >Norwegian</option><option value="fi" >Finnish</option><option value="vo" >Volapük</option><option value="ca" >Catalan</option><option value="ro" >Romanian</option><option value="tr" >Turkish</option><option value="uk" >Ukrainian</option><option value="eo" >Esperanto</option><option value="cs" >Czech</option><option value="hu" >Hungarian</option><option value="sk" >Slovak</option><option value="da" >Danish</option><option value="id" >Indonesian</option><option value="he" >Hebrew</option><option value="lt" >Lithuanian</option><option value="sr" >Serbian</option><option value="sl" >Slovenian</option><option value="ar" >Arabic</option><option value="ko" >Korean</option><option value="bg" >Bulgarian</option><option value="et" >Estonian</option><option value="new" >Newar / Nepal Bhasa</option><option value="hr" >Croatian</option><option value="te" >Telugu</option><option value="ceb" >Cebuano</option><option value="gl" >Galician</option><option value="th" >Thai</option><option value="el" >Greek</option><option value="fa" >Persian</option><option value="vi" >Vietnamese</option><option value="nn" >Norwegian (Nynorsk)</option><option value="ms" >Malay</option><option value="simple" >Simple English</option><option value="eu" >Basque</option><option value="bpy" >Bishnupriya Manipuri</option><option value="bs" >Bosnian</option><option value="lb" >Luxembourgish</option><option value="ka" >Georgian</option><option value="is" >Icelandic</option><option value="sq" >Albanian</option><option value="br" >Breton</option><option value="la" >Latin</option><option value="az" >Azeri</option><option value="bn" >Bengali</option><option value="hi" >Hindi</option><option value="mr" >Marathi</option><option value="tl" >Tagalog</option><option value="mk" >Macedonian</option><option value="sh" >Serbo-Croatian</option><option value="io" >Ido</option><option value="cy" >Welsh</option><option value="pms" >Piedmontese</option><option value="su" >Sundanese</option><option value="lv" >Latvian</option><option value="ta" >Tamil</option><option value="nap" >Neapolitan</option><option value="jv" >Javanese</option><option value="ht" >Haitian</option><option value="nds" >Low Saxon</option><option value="scn" >Sicilian</option><option value="oc" >Occitan</option><option value="ast" >Asturian</option><option value="ku" >Kurdish</option><option value="hy" >Armenian</option><option value="commons.m" >Commons</option><option value="meta.m">Meta</option></select>';
		
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