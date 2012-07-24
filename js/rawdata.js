$(document).ready(function(){ 
        
	//$("#options").tablesorter({sortList: [[0,0]], headers: { 3:{sorter: false}, 4:{sorter: false}}});
	
	// Reads the current page's URL parameters and iterates through them as an associative array.
	// Submits form data -- i.e., title of Page(s), 'from' date and 'to' date, to PHP controller
	// Upon getting feedback from the server, the 'onDataReceived' method is called to plot the data
	
	
	function writeTable(data){
		
		var d = data;
		var groups = d.groups;
		var numPages = groups.length;
		
		var table = '';
		
		table += '<thead><tr><th>Date</th>';
		
		
		for (i = 0; i < numPages; i++){
			table += '<th>' + groups[i]['page'] + '</th>';
		}
		
		table += '</tr></thead><tbody>';
		
		var numOfDays = groups[0]['trafficData'].length;
		
		for (i = 0; i < numOfDays; i++){
			
			date = new Date(groups[0].trafficData[i][0]);
			
			date = (date.getUTCMonth() + 1) + "/" + (date.getUTCDate()) + "/" + date.getUTCFullYear();
			
			
			table += '<tr><td>' + date + '</td><td>' + groups[0]['trafficData'][i][1] + '</td>';
			
			if (groups[1] !== undefined){
				table += '<td>' + groups[1]['trafficData'][i][1] + '</td>';
			}
			
			if (groups[2] !== undefined){
				table += '<td>' + groups[2]['trafficData'][i][1] + '</td>';
			}
			
			table += '</tr>';
		}

		table += '</tbody>';
		
		$('#raw_data').append(table);
		
		$("#raw_data").tablesorter({sortList:[[0, 0]], widgets: ['zebra']}); 
	}
	
	function writeCsvLink(csvFileName) {
		$("#raw_data").before('<a href="' + csvFileName + '">CSV file of this data</a>');
	}
	
	$.ajax({
		url: 'http://toolserver.org/~emw/index.php?c=rawdata&m=get_traffic_data',
		data: window.location.href.split('?')[1],
		dataType: 'json',
		method: 'GET',
		success: function(data){
			writeTable(data)
			writeCsvLink(data.csv_file);
		}
	});

}); 