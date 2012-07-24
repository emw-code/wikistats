/*
wikistats.js

Copyright (c) 2012 Emw
Dual licensed under MIT and GPL
*/

$(function () {
	
	// Gets project name (e.g. "en") and domain (e.g. "wikipedia)
	// given a project string (e.g. "en.wikipedia.org").
	function getProjectNameAndDomain(project){
			
		var projectName, domain;
		
		wmSplit = project.split('.');
		
		if (wmSplit.length > 1) {
			firstChar = wmSplit[0][0].toUpperCase();
			projectName = "Wikimedia " + firstChar + wmSplit[0].substring(1);
			domain = wmSplit[0] + '.wikimedia.org';
		} else {
			projectName = $('#project1 option[value="' + project + '"]').text() + " Wikipedia";
			domain = project  + ".wikipedia.org";
		}
		
		var pd = {
			"projectName": projectName,
			"domain": domain
		};
		
		return pd;
	}

	// Calculates the standard deviation of a data set.
	// http://en.wikipedia.org/wiki/Standard_deviation
	function getStandardDeviation(data, mean, sample_size){
		
		var 	sd_numerator = 0,
			total = 0,
			truncated_sample_size = 0,
			this_datum;
		
		if (mean > 100) {
			
			for (var j = 0; j < sample_size; j++){
				this_datum = data.trafficData[j][1];
				if (this_datum > 0) {
					total += this_datum;
					truncated_sample_size++;
				} else {
					interpolation_flag = 1;
				}
			}
			
			mean = Math.round(total/sample_size);
			
			for (var j = 0; j < sample_size; j++){
				sd_numerator += Math.pow((data.trafficData[j][1]  - mean), 2); // (x_i - mean_of_x)^2
			}
		} else {
			for (var j = 0; j < sample_size; j++){
				sd_numerator += Math.pow((data.trafficData[j][1] - mean), 2); // (x_i - mean_of_x)^2
			}
		}
		
		return Math.round(Math.pow(sd_numerator/sample_size, 0.5));
						
	}

	// Helps automatically infer the cause of drastic traffic spikes in a given article.
	function inferCauseOfTrafficBurst(articleName, trafficData, mean, sample_size, standardDeviation){
		
		// A "spike" here represents a value that is 5 sigma greater than the mean, which has a 5.73e-7 (about one in 50 million)
		// chance of occuring in a normally distributed population.  
		// Most traffic data isn't not statistically normal, so using 5sigma should remove a lot of noise.
		var 	spike = mean + (5 * standardDeviation),
			articleName = articleName.replace(/\s/g, "_"),
			reasonToInfer = "false",
			spikes = {},
			firstDate = '',
			epochTime, pageViews,
			date, month, day,
			deathDate,
			inferences,
			ymd, year,
			pDate, pMonth, pYear, pDay, previousDay,
			causes;
		
		//console.log(spike);
		//console.log(articleName);
		
		for (var i = 0; i < sample_size; i++){
			epochTime = trafficData[i][0];
			pageViews = trafficData[i][1];
			
			//console.log(pageViews);
			
			if (pageViews > spike) {
				//console.log('monster');
				date = new Date(epochTime);
				month = date.getUTCMonth() + 1;
				day = (date.getUTCDate());
							
				date = month + "/" + day + "/" + date.getUTCFullYear();
				
				if (firstDate == '') firstDate = date;
				
				spikes[date] = 1;
				reasonToInfer = "true";
			}
		}
		
		//console.log('reasonToInfer: ' + reasonToInfer);
		
		if (reasonToInfer == "true"){
			
			deathDate = '';
			
			$.ajax({
				url: 'http://toolserver.org/~emw/index.php?c=wikistats&m=infer',
				data: 'articleName=' + articleName + '&date=' + firstDate,
				method: 'GET',
				dataType: 'json',
				async: false,
				success: function(data){
					// comes back as YYYY-MM-DD
					inferences = data;
				}
			});
			
			
			if (typeof inferences == "undefined" || inferences === inferences.length == 0) return '';
			
			ymd = inferences[0].date.split('-');
			
			year = ymd[0];
			month = ymd[1];
			day = ymd[2];
			
			//console.log(day);
			
			if (month[0] == "0") month = month[1];
			if (day[0] == "0") day = day[1];
			
			date = month + '/' + day + '/' + year;
			
			pDate = (day == 1) ? new Date(year, month, 0) : new Date(year, (month - 1), (day -1));
				
			pYear = pDate.getFullYear();
			pMonth = (pDate.getMonth() + 1);
			pDay = (pDate.getDate() + 1);
			
			previousDay = pMonth + '/' + pDay + '/' + pYear;
			
			/*
			console.log(spikes.toSource());
			console.log(date);
			console.log(date in spikes);
			console.log(previousDay);
			*/
			causes = [];
			
			$.each(inferences, function(index, inference){
				causes.push(inference.cause);
			});
			
			
			if (date in spikes || date == previousDay) {
				return {dates: spikes, causes: causes, dateOfCause: date};
			}
			
		}
		
	}


	function processURLParameters(){
		
		//console.log('processURLParameters');
		
		// Reads the current page's URL parameters and iterates through them as an associative array.
		// If plot == 1, then click the Go button and plot the data
		var 	hash,
			hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&'),
			param, value,
			pd, projectName, optionElements, option;
		
		for(var i = 0; i < hashes.length; i++){
			hash = hashes[i].split('=');
			param = hash[0];
			value = hash[1];
			switch (param){
				case 'p1':
				case 'p2':
				case 'p3':
					if (/_/.test(value)) value = value.replace(/_/g, ' ');
					if (param != 'p1') $('#page_inputs').append('<input class="dataSeries page" type="text" size="30" id="' + param + '" name="' + param + '" value="' + value + '"/>');
					$('#' + param).val(value);
					break;
				case 'from':
				case 'to':
					$('#' + param).val(value);
					break;
				case 'project':
				case 'project1':
				case 'project2':
				case 'project3':
				
					if (param == 'project') param = 'project1';
				
					pd = getProjectNameAndDomain(value);
					
					projectName = pd.projectName;
					optionElements = $('#project1').html();
					//console.log('gotOptions');
					if (param != 'project1'){
						//console.log('another project');
						previousProjectSelector = '#project' + (parseInt(param[param.length - 1]) - 1);
						//console.log(previousProjectSelector);
						$('<select class="dataSeries project" id="' + param + '" name="' + param + '">' + optionElements + '</select>').insertAfter(previousProjectSelector);
					}
					//console.log('passed param!= project1');
					option = $('#' + param + ' option[value="' + value + '"]');
					
					if (option.length == 0) {
						$('#' + param).append("<option value='" + value + "'>" + projectName + "</option>");
					}
					
					$('#' + param + ' option[value="' + value + '"]').attr('selected', 'selected');
					//console.log('breaking');
					if (param == 'project3'){
						$('#add_project').hide();
						$("#subtract_project").show();
					}
					break;
				case 'plot':
					$('#go_button').click()
					break;
			}
		}
		
	}


	// Notifies the user if the page(s) they entered does not exist on Wikipedia
	function noteNonexistentPages(nonpages){
		
		var 	projectName, domain,
			projects = [],
			num_of_nonpages = nonpages.length,
			nonpage_1, nonpage_3, nonpage_3,
			num_of_nonpages,
			pd, projectName, domain;
		
		$('#wait_notice').hide();
		$('#notice').show();
		$('#link_span').remove();
		
		nonpage_1 = nonpages[0].page
		
		$.each(nonpages, function(index, nonpage){
			
			pd = getProjectNameAndDomain(nonpage.project);
			projectName = pd.projectName;
			domain = pd.domain;
			
			projects.push([projectName, domain]);
		});
		
		//console.log(num_of_nonpages);
		
		if (projects.length == 1){
			if (num_of_nonpages == 1){
				$('#notice').html("The article <a href='http://" + domain + "/wiki/" + nonpage_1 + "'>" + nonpage_1 + "</a> does not exist on " + projectName + ".");
			} else if (num_of_nonpages == 2){
				nonpage_2 = nonpages[1].page;
				$('#notice').html("Neither <a href='http://" + domain + "/wiki/" + nonpage_1 + "'>" + nonpage_1 + "</a>  nor <a href='http://" + domain + "/wiki/" + nonpage_2 + "'>" + nonpage_2 + "</a> exist as articles on " + projectName + ".");
			} else if (num_of_nonpages == 3){
				nonpage_2 = nonpages[1].page
				nonpage_3 = nonpages[2].page
				$('#notice').html("Neither <a href='http://" + domain + "/wiki/" + nonpage_1 + "'>" + nonpage_1 + "</a>, <a href='http://" + domain + "/wiki/" + nonpage_2 + "'>" + nonpage_2 + "</a> nor <a href='http://" + domain + "/wiki/" + nonpage_3 + "'>" + nonpage_3 + "</a> exist as articles on " + projectName + ". :-(");
			}
		} else {
			if (num_of_nonpages == 2){
				$('#notice').html('There are no interwiki links for \'' + nonpage_1 + '\' on ' + projects[0][0] + ' or ' + projects[1][0]);
			}
		}
	}
	
	
	// Setting up some display and behavior parameters for plot
	// Plotting is done with the jQuery 'Flot' library
	var options = {
		lines: { show: true },
		points: { show: true },
		xaxis: {mode: "time", timeformat: "%m/%d/%y", panRange: [null, null]},
		yaxis: { zoomRange: [0.1, null]},//, panRange: [-1, 1] },
		grid: { hoverable: true, clickable: true },
		zoom: { interactive: true},
		pan: { interactive: true}
	};
	 
	
	// TODO: replace this browser detection with jQuery's support() method
	var 	browser_is_IE = 'false',
		browser_is_Chrome = 'false',
		data = [],
		placeholder = $("#placeholder");
	
	if (navigator.appName == 'Microsoft Internet Explorer'){
		browser_is_IE = 'true';
	}
	
	if (navigator.userAgent.search("Chrome") > -1){
		browser_is_Chrome = 'true';
	}
	
		
	// 'placeholder' is the div into which Flot inserts the plot canvas
	placeholder = $("#placeholder");

	$.plot(placeholder, data, options);    
	
	// Clicking the 'Go' button triggers a cascade of functions.
	$('#go_button').click(function(){
		
		var 	urlParams = '',
			button = $(this),
			projects = [];
		
		$('#notice').hide();
		 
		if($('#p1').val().length == 0){
			$('#link_span').remove();
			$('#notice').show();
			$('#notice').html("Please enter a Wikipedia article title (e.g., Haiku) into the 'Page' field and retry.");
			return
		} else {
			if ($('#p1').val().match(/http\:\/\/.*/)){
				$('#link_span').remove();
				$('#notice').show();
				$('#notice').html("Please enter the article title's (e.g., Haiku), and not its URL.");
				return
			} else {
				// Makes plot area translucent, and adds spinning circular 'busy' icon to top-right of plot area
				$('<div id="interstitial_screen"></div>').insertAfter('#placeholder');
				
				// Disables 'Go' button until the Ajax calls succeeds.
				$('#go_button').attr('disabled', 'disabled').css('color', 'gray');
				
				$('#link_span').remove();
				
				// Here we want a "wait notice" to fade in.
				var t = setTimeout("$('#wait_notice').fadeIn(200, function(){$('#wait_notice').html('Data may take up to 60 seconds per page to retrieve from remote server.')});", 4000);
			}
		}
		
		// Set the GET parameters
		$.each($(".dataSeries"), function($this){
			if ($(this).attr("name") != 'to'){
				urlParams += $(this).attr("name") + "="  + $(this).val();
				urlParams += "&"
				if (/project/.test($(this).attr("name"))){
					projects.push($(this).val());
				}
			} else {
				urlParams += $(this).attr("name") + "="  + $(this).val();
			}
		});
		
		// Submits form data -- i.e., title of Page(s), 'from' date and 'to' date, to PHP controller
		// Upon getting feedback from the server, the 'onDataReceived' method is called to plot the data
		$.ajax({
			url: 'http://toolserver.org/~emw/index.php?c=wikistats&m=get_traffic_data',
			data: urlParams,
			dataType: 'json',
			method: 'GET',
			success: function(series) {
				onDataReceived(series);
			}
		});
		
		// Executes a cascade of functions after data is returned from the server.
		function onDataReceived(series) {
			
			//console.log("onDataReceived");
						
			var groups = series.groups;
						
			//console.log('groups.length = ' + groups.length);
			
			//$('body').append('<div id="foo">' + series.toSource() + '</div>');
			
			$('#link_span').remove();
			
			var 	escapedUrlParams = urlParams.replace(/\s/g, '_'),
				plot_permalink = "http://toolserver.org/~emw/wikistats/?" + escapedUrlParams + "&plot=1",
				raw_data = "http://toolserver.org/~emw/rawdata/?" + escapedUrlParams,
			
				permalink_left_margin = "260px",	
				dialog_height = 85;
			
			if (browser_is_Chrome == 'true'){
				permalink_left_margin = "270px";
				dialog_height = 95;
			}
			
			if (browser_is_IE == 'true'){
				dialog_height = 68;
			}
			
			
			if($('#notice').is(':hidden')){
				$('<span id="link_span" style="position:relative; top: 5px; margin-left:' + permalink_left_margin + '"><a id="permalink" href="' + plot_permalink + '">Link here</a></span>').insertAfter('#notice')
				//$('<span id="link_span" style="position: absolute; top: 155px; left: 715px;"><a id="permalink" href="' + plot_permalink + '">Link</a></span>').insertAfter('#placeholder')
				$('<a style="position:relative; left: 10px;" id="raw_data" href="' + raw_data + '">Raw data</a>').insertAfter('#permalink');
				//position: absolute; top: 7px; left: 710px; font-size: smaller; color: rgb(84, 84, 84);
				$('#permalink').click(function(event){
					event.preventDefault();
					$('<div id="dialog" title="Graph URL"><input type="text" size=60 value="' + plot_permalink + '" /></div>').insertAfter('#header');
					$('#dialog').dialog({ width: 'auto', height: 60, minHeight: 60, position: [717, dialog_height], resizable: false });
				});
			}
			
			
			// Hide the translucent overlay from the plot area
			$('#interstitial_screen').remove()
			
			// Re-enable the 'Go' button, and set it to use black text to indicate this.
			$('#go_button').removeAttr('disabled').css('color', 'black');
			
			//var project = projects[0];
			
			
			var nonpages = series.nonexistent_pages;
			
			// Notifies the user if the page(s) they entered does not exist on Wikipedia
			if (nonpages.length > 0){
				clearTimeout(t);
				
				noteNonexistentPages(nonpages);
				
				if (!series.label_1) return;
			}
			
			clearTimeout(t)
			$('#wait_notice').hide();
			 var plot = $.plot(placeholder, data, options);
			    // little helper for taking the repetitive work out of placing
			    // panning arrows
			
			//alert(series.data_1.length)
			//plot.setPanRange({axis:'xaxis', min:series.data_1[0][0], max:null});
			
			var firstGroup = series.groups[0].trafficData;
			
			options.xaxis.panRange = [firstGroup[0][0], firstGroup[firstGroup.length-1][0]]
			options.xaxis.zoomRange = [null, (firstGroup[firstGroup.length-1][0] - firstGroup[0][0])]
			//options.xaxis.panRange = [series.data_1[0][0], series.data_1[series.data_1.length-1][0]]
			
			
			
			//options.xaxis.zoomRange = [null, (series.data_1[series.data_1.length-1][0] - series.data_1[0][0])]
			
			
			
			//alert(plot.getUsedAxes()[0]);
			var handler =  function() {
				//options.legend.resizing = true;
				plot.zoomOut();
				$('#placeholder').unbind('click', handler);
			}
			
			$(window).keydown(function(e) {
				if(e.shiftKey) {
					$('#placeholder').bind('click', handler);
				}
			});
			
			 
			var 	dataToPlot = [],
				stats = groups;
			
			$('#detail_panel').remove()
						
			for (var i = 0; i < groups.length; i++){
				var 	trafficData = [],
					group = groups[i],
				
					nonWikipedia = /\./.test(group.project),
					wmSplit = group.project.split('.'),
					domain = (nonWikipedia) ? wmSplit[0] + '.wikimedia.org' : group.project  + ".wikipedia.org",
					
					datum = {},
					ymd, epochTime, viewCount;
						
				for (var j = 0; j < group.trafficData.length; j++) {
					
					ymd = group.trafficData[j][0].split('-');
					epochTime = new Date(ymd[0], parseInt(ymd[1] - 1), ymd[2]).getTime();
					// console.log(ymd + " " + epochTime);
					viewCount = group.trafficData[j][1];
					
					trafficData.push([epochTime, viewCount]);
				}
					
				datum.fromDate = series.fromDate;
				datum.toDate = series.toDate;
				datum.label = "<a href='http://" + domain + "/wiki/" + group.page + "'>" + group.page + "</a>";
				datum.data = trafficData;
				
				//console.log('datum: ' + datum.toSource());
				dataToPlot.push(datum);
					
			};
			
			// and plot all we got
			plot = $.plot(placeholder, dataToPlot, options);
			
			// This large conditional block adds 'Summary statistics' in a tabular data layout
			if($('.legend table thead').length == 0){
				$('.legend table').prepend(
					'<thead>' + 
						'<th></th>' + 
						'<th>Page</th>' + 
						'<th>Days</th>' + 
						'<th>Views</th>' + 
						'<th class="stat_head">' + 
							'<a href="http://en.wikipedia.org/wiki/Arithmetic_mean">Average</a>' + 
						'</th>' + 
						'<th class="stat_head">' + 
							'<a href="http://en.wikipedia.org/wiki/Standard_deviation">&sigma;</a>' + 
						'</th>' + 
					'</thead>'
				);
				
				// "interpolation_flag" is 1 if the average number of views for any page is greater than 100, and 0 otherwise
				// If this flag is set to 1, days with 0 views are not considered when calculating average or standard deviation
				var 	interpolation_flag = 0,
					
					burstAndCause = '';
					
				var total, sample_size, mean, standard_deviation;
				
				// "stats" is an array of objects, each containing data for different fetched pages
				for (var i = 0; i < stats.length; i++){
					
					data = stats[i];
					total = data.totalViews;
					sample_size = data.trafficData.length;
					mean = Math.round(total/sample_size);
					
					standard_deviation = getStandardDeviation(data, mean, sample_size);
					
					stats[i]["standard_deviation"] = standard_deviation;
					stats[i]["mean"] = mean;
					
					
					$('.legend table tbody tr:nth-child(' + (i + 1) + ')').attr('id', data.page + "_legend_row");
					$('.legend table tbody tr:nth-child(' + (i + 1) + ')').append("<td class='ldata'>" + sample_size + "</td><td class='ldata'>" + total + "</td><td class='ldata mean'>" + mean + "</td><td class='ldata sd'>" + standard_deviation + "</td>");
					
				}
				
				$('#info').show()
				if(interpolation_flag == 1){
					if ($('.th_starspan').length == 0)
						$('.stat_head').append("<span class='th_starspan' style='color:red; padding-left:3px'>*</span>");
					$('#cavaet').show();
				} else {
					$('#cavaet').hide();
				}
				
				$('.legend table tr').click(function(){
					var mean = this.cells.item(4).innerHTML;
					mean = mean.replace(/,/g, "");
					
					var sd = this.cells.item(5).innerHTML;
					sd = sd.replace(/,/g, "");

					/* "set_stat_summary" is a plug-in I wrote for Flot
					    It plots the average (as a red line) and 
					    the 66% confidence interval -- i.e., the average + and - one standard deviation (as two blue lines)
					*/
					plot.set_stat_summary(mean, sd);
				});
				
				// Replace the raw int values in the Stat table with more easily readable comma-formatted strings of those numbers.
				$.each($('.ldata'), function(i, val){
					$(this).html(comma($(this).html()));
				});
			}
				
			
			
			i = 0
			$.each($('.legend').children(), function($this){
				if(i == 0) $(this).hide();
				i++
			});
			
			// Styles the 'Summary statistics' table to the left of the plot area.
			//$('.legend table').attr('style', 'position: absolute; top: 107px; left: 710px; font-size: smaller; color: rgb(84, 84, 84);');
			$('.legend table').attr('style', 'position: absolute; top: 7px; left: 710px; font-size: smaller; color: rgb(84, 84, 84);');
		
			$('.legend table').attr('cellspacing', '0');
			
			for (i = 0; i < stats.length; i++){
				
				data = stats[i];
				
				burstAndCause = inferCauseOfTrafficBurst(data.page, data.trafficData, data.mean, data.sample_size, data.standard_deviation);
			}
			
			function showTooltip(x, y, contents) {
				
				fadeTime = 300
				
				// IE takes a while to render the Tooltip, so don't make it wait an extra 300 ms
				if (browser_is_IE == 'true'){
					fadeTime = 0;
				}
				
				$('<div id="tooltip">' + contents + '</div>').css({
					position: 'absolute',
					display: 'none',
					top: y + 5,
					left: x + 5,
					border: '1px solid #fdd',
					padding: '2px',
					'background-color': '#fee',
					opacity: 1.0
				}).appendTo("body").fadeIn(fadeTime);
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
						date = (date.getUTCMonth() + 1) + "/" + (date.getUTCDate()) + "/" + date.getUTCFullYear();
						
						var label = "Views for " + item.series.label + " on "  +  date +  ": " + comma(y);
						
						//console.log('burstAndCause: ' + burstAndCause.toSource());
						
						if (burstAndCause !== undefined && burstAndCause != '' && date in burstAndCause.dates){
							
							causes = "<ul>";
							$.each(burstAndCause.causes, function(index, cause){
								causes += '<li>' + cause + ' on: ' + burstAndCause.dateOfCause + '</li>';
							});
							causes += "</ul>";
							
							label = 
								"Views for " + item.series.label + " on "  +  date +  ": " + comma(y) + 
								'<br/>Cause of spike: ' + causes;
						}
						
						showTooltip(
							item.pageX, 
							item.pageY,
							label
						);
					}
				} else {
					$("#tooltip").remove();
					previousPoint = null;            
				}
			});
		
			
		};
        
	});
	
	processURLParameters();

});