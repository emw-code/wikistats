$(function () {
	var options = {
		lines: { show: true },
		points: { show: true },
		xaxis: {mode: "time", timeformat: "%m/%d/%y"},
		grid: { hoverable: true, clickable: true }
	};
    
	
	$('button').hover(
		function(){ 
			$(this).addClass("ui-state-hover"); 
		},
		function(){ 
			$(this).removeClass("ui-state-hover"); 
		}
	)
	
	//$('#fetchViews').append('<div>hello</div>');
	$('#fetchViews').removeAttr('disabled');
		
	// This 'comma' function was taken from http://javascript.internet.com/text-effects/add-commas.html
	function comma(number) {
		number = '' + number;
		if (number.length > 3) {
			var mod = number.length % 3;
			var output = (mod > 0 ? (number.substring(0,mod)) : '');
			for (i=0 ; i < Math.floor(number.length / 3); i++) {
				if ((mod == 0) && (i == 0))
					output += number.substring(mod+ 3 * i, mod + 3 * i + 3);
				else
					output+= ',' + number.substring(mod + 3 * i, mod + 3 * i + 3);
			}
			return (output);
		}
		else return number;
	}
	var data = [];
	var placeholder = $("#placeholder");

	$.plot(placeholder, data, options);


	// fetch one series, adding to what we got
	var alreadyFetchedLabels= {};
	var alreadyFetchedDates={};
	var dataPoints = '';
    
	var current = 1
	$('#add_page').click(function(){
		//current keeps track of how many pages we have.
		current++;

		if (current == 2){
			$("#subtract_page").show();
			$("#page_label").html("Pages");
			$("#p1").css({ "left": "3px", "margin-right": "3px"});
		}
		
		// Remove the add button after three pages
		if (current == 3){
			$('#add_page').hide();
		}
		
		var strToAdd = '<input class="dataSeries" type="text" size="30" id="p' + current + '" name="p' + current + '"/>'

		$(strToAdd).insertAfter('#p' + (current -1) + '');
	});
	
	$('#subtract_page').click(function(){
		//current keeps track of how many pages we have.
		current--
		
		if (current == 1){
			$("#page_label").html("Page");
			$("#p1").css({ "left": "11px", "margin-right": "11px"});
			$("#subtract_page").hide();
		}
		
		if (current == 2){
			$('#add_page').show()
		}
		if (current == 5){
			$('#add_page').show()
		}
		if (current == 6){
			$('#add_page').hide()
		}
		
		$('#p' + (current + 1)).remove();
	});

	
	$('#fetchViews').click(function(){
		$('<div id="interstitial_screen"></div>').insertAfter('#placeholder');
	
		dataPoints = '';
		 var button = $(this);
		 $('#notice').hide()
		
		 var t2;
		 $('#fetchViews').attr('disabled', 'disabled').css('color', 'gray');
		
		// var t = setTimeout("$('#wait_notice').fadeIn(200, function(){$('#wait_notice').html('Note: pages not in database may each take up to 30 seconds to retrieve.')});",3000);
		 
		 if($('#p1').val().length == 0){
		 
			$('#notice').show()
			$('#notice').html("Please enter a Wikipedia article title (e.g., William Shakespeare) into the 'Page' field and retry.");
			return
		 } else { 
			  function timedCount(){
				alert('hi')
				//$('#wait_notice').append('a');
				//seconds_waiting = seconds_waiting + 1;
				//t2=setTimeout("timedCount()",1000);
			}
			
			function getWaitingNotice(){
				alert('test')
				/*$('#wait_notice').fadeIn(200, function(){
					$('#wait_notice').html('Note: pages not in database may each take up to 30 seconds to retrieve.');   
				});*/
			}	
			//var t = setTimeout("$('#wait_notice').fadeIn(200, function(){$('#wait_notice').html('Note: pages not in database may each take up to 30 seconds to retrieve.');   var seconds_waiting = 4; function timedCount(){$('wait_notice').append('a '); seconds_waiting = seconds_waiting + 1; t2=setTimeout('timedCount()',1000);} timedCount();});", 4000);
			var t = setTimeout("$('#wait_notice').fadeIn(200, function(){$('#wait_notice').html('View data may take up to 30 seconds per page to retrieve.')});", 4000);
			
			

		 }
		 
		// Set the GET parameters
		$.each($(".dataSeries"), function($this){
			if ($(this).attr("name") != 'To'){
				dataPoints += $(this).attr("name") + "="  + $(this).val();
				dataPoints += "&"
			} else {
				dataPoints += $(this).attr("name") + "="  + $(this).val();
			}
		});
	

		//alert('test')
		// then fetch the data with jQuery
		function onDataReceived(series) {
			$('#interstitial_screen').remove()
			$('#fetchViews').removeAttr('disabled').css('color', 'black');
			//$('#wait_notice').hide()
			num_of_nonpages = series.nonexistent_pages.length
			if (num_of_nonpages > 0){	
				clearTimeout(t)
				$('#wait_notice').hide()
				nonpage_1 = series.nonexistent_pages[0]
				$('#notice').show()
				if (num_of_nonpages == 1){
					$('#notice').html("The article <a href='http://en.wikipedia.org/wiki/" + nonpage_1 + "'>" + nonpage_1 + "</a> does not exist on English Wikipedia.");
				} else if (num_of_nonpages == 2){
					nonpage_2 = series.nonexistent_pages[1]
					$('#notice').html("Neither <a href='http://en.wikipedia.org/wiki/" + nonpage_1 + "'>" + nonpage_1 + "</a>  nor <a href='http://en.wikipedia.org/wiki/" + nonpage_2 + "'>" + nonpage_2 + "</a> exist as articles on English Wikipedia.");
				} else if (num_of_nonpages == 3){
					nonpage_2 = series.nonexistent_pages[1]
					nonpage_3 = series.nonexistent_pages[2]
					$('#notice').html("Neither <a href='http://en.wikipedia.org/wiki/" + nonpage_1 + "'>" + nonpage_1 + "</a>, <a href='http://en.wikipedia.org/wiki/" + nonpage_2 + "'>" + nonpage_2 + "</a> nor <a href='http://en.wikipedia.org/wiki/" + nonpage_3 + "'>" + nonpage_3 + "</a> exist as articles on English Wikipedia. :-(");
				}
				if (!series.label_1){
					return
				}
			}
			
			clearTimeout(t)
			$('#wait_notice').hide()
			 var plot = $.plot(placeholder, data, options);
			 
			//alert(series)
			data = []
			stats = []
			//alert(series.data_1);
			$('#detail_panel').remove()
			
			page1_data = {}
			page1_data.fromDate = series.fromDate
			page1_data.toDate = series.toDate
			page1_data.label = "<a href='http://en.wikipedia.org/wiki/" + series.label_1 + "'>" + series.label_1 + "</a>"
			page1_data.data = series.data_1
			stats["page_1"] = {}
			//stats["page_1"].push(series.total_views_1);
			data.push(page1_data);
			page1_data.total_views = series.total_views_1
			page1_data.page = series.label_1
			stats.push(page1_data)
			
			if (series.label_2){
				page2_data = {}
				page2_data.fromDate = series.fromDate
				page2_data.toDate = series.toDate
				page2_data.label = "<a href='http://en.wikipedia.org/wiki/" + series.label_2 + "'>" + series.label_2 + "</a>"
				page2_data.data = series.data_2
				//stats["page_2"].push(series.total_views_2);
				data.push(page2_data);
				page2_data.total_views = series.total_views_2
				page2_data.page = series.label_2
				stats.push(page2_data)
			}
			
			if (series.label_3){
				page3_data = {}
				page3_data.fromDate = series.fromDate
				page3_data.toDate = series.toDate
				page3_data.label = "<a href='http://en.wikipedia.org/wiki/" + series.label_3 + "'>" + series.label_3 + "</a>"
				page3_data.data = series.data_3
				data.push(page3_data);
				page3_data.total_views = series.total_views_3
				page3_data.page = series.label_3
				stats.push(page3_data)
			}
			
			
	
			// and plot all we got
			var plot = $.plot(placeholder, data, options);
			/*if($('#detail_button').length == 0){
				$('<button id="detail_button" class="ui-state-default" style="position:relative; left: 245px;">Show summary statistics</button>').insertAfter('#fetchViews');
			} */
			
			//$('#detail_button').click(function(){
			if($('.legend table thead').length == 0){
				$('.legend table').prepend('<thead><th></th><th>Page</th><th>Days</th><th>Views</th><th class="stat_head"><a href="http://en.wikipedia.org/wiki/Arithmetic_mean">Average</a></th><th class="stat_head"><a href="http://en.wikipedia.org/wiki/Standard_deviation">&sigma;</a></th></thead>')
				for (i = 0; i < stats.length; i++){
					//alert (stats[i].total_views);
					total = stats[i].total_views
					sample_size = stats[i].data.length
					mean = Math.round(total/sample_size)
					sd_numerator = 0
					interpolation_flag = 0
					if (mean > 100){
						total = 0
						truncated_sample_size = 0
						for (j = 0; j < sample_size; j++){
							this_datum = stats[i].data[j][1] 
							if(this_datum > 0){
								total += this_datum
								truncated_sample_size++
							} else {
								interpolation_flag = 1
							}
						}
						
						mean = Math.round(total/sample_size)
						for (j = 0; j < sample_size; j++){
							sd_numerator += Math.pow((stats[i].data[j][1]  - mean), 2) // (x_i - mean_of_x)^2
						}
					}
					else{
						for (j = 0; j < sample_size; j++){
							sd_numerator += Math.pow((page1_data.data[j][1] - mean), 2) // (x_i - mean_of_x)^2
						}
					}
					standard_deviation = Math.round(Math.pow(sd_numerator/sample_size, 0.5))
					//alert($('.legend table tr:nth-child(' + (i + 1) + ' )').html());
					//alert(total)
					$('.legend table tr:nth-child(' + (i + 1) + ')').attr('id', stats[i].page + "_legend_row");
					$('.legend table tr:nth-child(' + (i + 1) + ')').append("<td class='ldata'>" + sample_size + "</td><td class='ldata'>" + total + "</td><td class='ldata mean'>" + mean + "</td><td class='ldata sd'>" + standard_deviation + "</td>");
					
					$('#info').show()
					if(interpolation_flag == 1){
						if ($('.th_starspan').length == 0)
							$('.stat_head').append("<span class='th_starspan' style='color:red; padding-left:3px'>*</span>")
						$('#cavaet').show()
					} else {
						$('#cavaet').hide()
					}
				}
				
				$('.legend table tr').click(function(){
					//alert('qwer')
					
					mean = this.cells.item(4).innerHTML
					mean = mean.replace(/,/g, "");
					//alert(mean)
					
					sd = this.cells.item(5).innerHTML
					sd = sd.replace(/,/g, "");

					plot.set_stat_summary(mean, sd)
					
					
				});
				

				
				$.each($('.ldata'), function(i, val){
						$(this).html(comma($(this).html()))
				});
			}
				
			//});
			
			
			function showTooltip(x, y, contents) {
				//alert("set");
				$('<div id="tooltip">' + contents + '</div>').css( {
					position: 'absolute',
					display: 'none',
					top: y + 5,
					left: x + 5,
					border: '1px solid #fdd',
					padding: '2px',
					'background-color': '#fee',
					opacity: 1.0
				}).appendTo("body").fadeIn(300);
			}
		
			var previousPoint = null;
			$("#placeholder").bind("plothover", function (event, pos, item) {
				//alert("test");
				
				$("#x").text(pos.x.toFixed(2));
				$("#y").text(pos.y.toFixed(2));
				
				if (item) {
					if (previousPoint != item.datapoint) {
						previousPoint = item.datapoint;

						$("#tooltip").remove();
						var x = item.datapoint[0],
						y = item.datapoint[1].toFixed(0);
						date = new Date(x);
						showTooltip(item.pageX, item.pageY,
						"Views for " + item.series.label + " on "  +  (date.getUTCMonth() + 1) + "/" + (date.getUTCDate()) + "/" + date.getUTCFullYear() +  ": " + comma(y));
					}
				} else {
					$("#tooltip").remove();
					previousPoint = null;            
				}
			});
		
			
			
			
			 i = 0
			$.each($('.legend').children(), function($this){
				if(i == 0) $(this).hide();
				i++
			});
			
			$('.legend table').attr('style', 'position: absolute; top: 7px; left: 710px; font-size: smaller; color: rgb(84, 84, 84);');
			$('.legend table').attr('cellspacing', '0');
		};
        
		$.ajax({
			url: 'stats.php',
			data: dataPoints,
			dataType: 'json',
			method: 'GET',
			success: onDataReceived
		});
	});

});