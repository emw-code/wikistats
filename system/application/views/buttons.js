$(function () {

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
	console.log(current_num_pages);
		
		
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
			$("#p1").css({ "left": "3px", "margin-right": "3px"});
		}
		
		if (current_num_pages== 3){
			$('#add_page').hide();
		}
		
		var strToAdd = '<input class="dataSeries page" type="text" size="30" id="p' + current_num_pages + '" name="p' + current_num_pages + '"/>'

		$(strToAdd).insertAfter('#p' + (current_num_pages -1) + '');
	});

	$('#subtract_page').click(function(){
		//current keeps track of how many pages we have.
		current_num_pages--
		
		if (current_num_pages == 1){
			$("#page_label").html("Page");
			$("#p1").css({ "left": "11px", "margin-right": "11px"});
			$("#subtract_page").hide();
		}
		
		if (current_num_pages == 2){
			$('#add_page').show()
		}
		
		$('#p' + (current_num_pages + 1)).remove();
	});

	// end + and - button behavior

});