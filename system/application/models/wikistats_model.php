<?php
/*
wikistats_model.php

Copyright (c) 2012 Emw
Dual licensed under MIT and GPL licenses
*/


class Wikistats_model extends Model {
	
	function Wikistats_model() {
		parent::Model();
	
		$ts_pw = posix_getpwuid(posix_getuid());
		$ts_mycnf = parse_ini_file($ts_pw['dir'] . "/.my.cnf");
		$db = mysql_connect('sql.toolserver.org', $ts_mycnf['user'], $ts_mycnf['password']);
		unset($ts_mycnf);
		unset($ts_pw);
 
		if (!$db){
			die('Could not connect: ' . mysql_error());
		}

		mysql_select_db("u_emw", $db);

		set_time_limit(240);
	}
	
	// Given a $page and an array of $projects, returns an array of links to
	// the $page on those $projects (typically, different language versions of the 
	// Wikipedia article given in $page).
	// Example:
	// langLinks = getLangLinks(["de", "fr"], "Protein")
	// var_dump(langLinks) 
	// 	array(3) {
	//		["en"]=>
	//		string(4) "Tree"
	//		["de"]=>
	//		string(4) "Baum"
	//		["fr"]=>
	//		string(5) "Arbre"
	//	}
	function getLangLinks($projects, $page){

		$langLinkedPages = array($projects[0] => $page);
		
		ini_set('user_agent', 'Mozilla/5.0');
		$xml = simplexml_load_file('http://' . $projects[0] . '.wikipedia.org/w/api.php?action=query&prop=langlinks&titles=' . $page . '&format=xml&lllimit=max');
		
		foreach ($xml->xpath('//ll') as $langLink){
			
			if (in_array($langLink['lang'], $projects)) {
				
				// try to type check
				$lang = (string)$langLink['lang'];
				$langLink = (string)$langLink;
				$langLinkedPages[$lang] = $langLink;
			}
		}
		return $langLinkedPages;
	}

	function check_page_existence($projects, $pages){
	
		// For performance monitoring
		$timing = array();
	
		$num_of_pages = sizeof($pages);
		$num_of_projects = sizeof($projects);
		
		$nonexistentInterwikiVersions = array();
		
		$iterator_length = $num_of_pages;
		$iterator = "pages";
		
		$nonexisting_pages = array();
		$existing_pages = array();
		
		// If there is only 1 page but multiple projects being requested, set the iterator to 'projects' and 
		// add any language-linked pages found on those projects to $pages.  Decrement iterator_length
		// if the given $page is missing in a given $project (e.g. if the user asks for the German version of an
		// English article, but the German version doesn't exist).
		if ($num_of_pages == 1 && $num_of_projects > 1) {
			
			$iterator_length = $num_of_projects;
			$iterator = "projects";
			
			$time_begin = microtime(true);
			$langLinkedPages = $this->getLangLinks($projects, $pages[0]);
			$time_end = microtime(true);
			
			$timing["getLangLinks"] = $time_end - $time_begin;
			
			for ($i = 1; $i < $num_of_projects; $i++){
				
				$project = $projects[$i];
				
				if (isset($langLinkedPages[$project])){
					array_push($pages, $langLinkedPages[$project]);
				} else {
					$nonexisting_pages[$project] = $pages[0];
					$iterator_length--;
				}
			}
		}
		
		
		for ($i = 0; $i < $iterator_length; $i++) {
			
			$timing_iterator = array();
			
			if ($iterator == "projects"){
				$page_iterator = $pages[$i];
				$project_iterator = $projects[$i];
			} else {
				$page_iterator = $pages[$i];
				$project_iterator = $projects[0];
			}
			
			$page = str_replace("%20", " ", $page_iterator);
			
			$project = $project_iterator;
			$formatted_page = rawurlencode($page);
			
			$formatted_page = str_replace("%2F", "/", $formatted_page);
			
			$total_views = 0;
			
			$time_begin_0 = microtime(true);
			$sql = "SELECT Page FROM stats WHERE Project='" .  $project . "' AND Page='" . $formatted_page . "' LIMIT 1;";
			$result = mysql_query($sql) or die("Query failed with error: ".mysql_error());
			$numRows = mysql_num_rows($result);
			$timing_iterator["SELECT 1"] = microtime(true) - $time_begin_0;
			
			
			// If view count data for the page isn't stored in the database, then fetch it from Henrik's service.
			if ($numRows == 0){
				
				$time_begin_1 = microtime(true);
				$output = system('python system/application/models/parse_pagecount.py --project ' . $project . ' --page ' . $formatted_page, $return_value);
				$time_end_1 = microtime(true);
				$timing_iterator["parse_pagecount.py, $numRows == 0"] = $time_end_1 - $time_begin_1;
				//echo "bar 1: " . (string)($time_end_1 - $time_begin_1) . "\n\n";
			
				if ($return_value == 1){
					$nonexisting_pages[$project] = $page;
				} else {
					if (isset($existing_pages[$project])){
						array_push($existing_pages[$project], $page);
					} else {
						$existing_pages[$project] = array($page);
					}
				}
			} else {
				// If the page exists, ensure that the traffic data stored in u_emw is also up to date 
				$yesterdaysDate = date('Y-m-d', mktime(0, 0, 0, date('m'), date('d') - 1, date('Y'))); # YYYY-MM-DD, e.g., 2011-11-05
				$yesterdaysMonth = date('m', mktime(0, 0, 0, date('m'), date('d') - 1, date('Y')));
				
				//echo $yesterdaysDate;
				//echo $yesterdaysMonth;
				
				$time_begin_2 = microtime(true);
				// Get the most recent date for which a view count exists for the given page
				$sql2 = 	
					"SELECT Date " .
					"FROM stats " .
					"WHERE " .
						"Project='" . $project . "' AND " .
						"Page='" . $formatted_page . "' " .
						"ORDER BY DATE DESC LIMIT 1;";
				$result2 = mysql_query($sql2) or die("Query failed with error: ".mysql_error());
				$numRows2 = mysql_num_rows($result2);
				$time_end_2 = microtime(true);
				$timing_iterator["SELECT 2"] = $time_end_2 - $time_begin_2;
				//echo "bar 2: " . (string)($time_end_2 - $time_begin_2) . "\n\n";
				
				while($row = mysql_fetch_array($result2, MYSQL_ASSOC)){
					$mostRecentDate = "" . $row['Date'];
				}
				
				if ($mostRecentDate != $yesterdaysDate){
					//echo 'not found';
					$time_begin_3 = microtime(true);
					system('python system/application/models/parse_pagecount.py --project ' . $project . ' --page ' . $formatted_page . ' --mostRecentDate ' . $mostRecentDate);
					$time_end_3 = microtime(true);
					$timing_iterator["parse_pagecount.py, update"] = $time_end_3 - $time_begin_3;
				}
				if (isset($existing_pages[$project])){
					array_push($existing_pages[$project], $page);
				} else {
					$existing_pages[$project] = array($page);
				}
			}
			
			array_push($timing, $timing_iterator);
		}
		
		$returned_tuple = array();
		array_push($returned_tuple, $nonexisting_pages);
		array_push($returned_tuple, $existing_pages);
		array_push($returned_tuple, $timing);
		return $returned_tuple;
	}
	
	function get_by_range_json($existing_pages, $from_date, $to_date){

		$projects = array();
		$pages = array();
		
		foreach($existing_pages as $project => $page){
			
			for($i = 0; $i < sizeof($page); $i++){
				array_push($pages, $page[$i]);
			}
			array_push($projects, $project);
		}
		
		
		$json = '';
		$num_of_pages = sizeof($pages);
		$num_of_projects = sizeof($projects);
		
		$iterator_length = $num_of_pages;
		$iterator = "pages";
		
		if ($num_of_projects > 1){
			$iterator_length = $num_of_projects;
			$iterator = "projects";
		}
		//echo '<PROJECTS>' . implode(",", $projects) . '</PROJECTS>';
		
		$json .= '"groups": [';
		
		for ($i = 0; $i < $iterator_length; $i++) {
			//$formatted_page = str_replace(" ", "_", $pages[$i]);
			$json .= '{';
			
			if ($iterator == "projects"){
				//echo '<iterator = projects/>';
				$page_iterator = $pages[$i];
				$project_iterator = $projects[$i];
			} else {
				$page_iterator = $pages[$i];
				$project_iterator = $projects[0];
			}
			
			$page = str_replace("%20", " ", $page_iterator);
			$project = $project_iterator;
			
			//echo '<project>' . $project . '</project>';
			$formatted_page = rawurlencode($page);
			
			$formatted_page = str_replace("%2F", "/", $formatted_page);
			
			#echo $formatted_page;
			$total_views = 0;
			#$sql = "SELECT * FROM stats where Page='" . $page . "' AND Date BETWEEN '" . $from_date . "' AND '" . $to_date "';";
			//$sql = "SELECT Page, Views, Date FROM stats where binary Page='" . $formatted_page . "' AND Date BETWEEN '" . $from_date . "' AND '" . $to_date . " ' ORDER BY Date;";
			$sql = "SELECT Page, Views, Date FROM stats where project='" . $project . "' AND Page='" . $formatted_page . "' AND Date BETWEEN '" . $from_date . "' AND '" . $to_date . " ' ORDER BY Date;";
			
			$time_begin = microtime(true);
			$result = mysql_query($sql) or die("Query failed with error: ".mysql_error());
			$time_end = microtime(true);
			
			//echo $time_end - $time_begin;
			
			$numRows = mysql_num_rows($result);
			$loopCount = 1;
			$j = $i + 1;
			
			$json .= '"page": "' . $pages[$i] . '", "trafficData": [';
			
			while($row = mysql_fetch_array($result, MYSQL_ASSOC)){
				$total_views += $row['Views'];
				//$timestamp = strtotime($row['Date'])*1000;
				$timestamp = "" . $row['Date'];
				$json .= "[\"$timestamp\", {$row['Views']}]";
				#$json .= "[$loopCount, {$row['Views']}]";
				if ($loopCount < $numRows) {
					$json .= ', ';
					$loopCount++;
				}
			}
			$json .= '], "project": "' . $project . '", "totalViews": "' . $total_views . '"';
			
			$json .= '}';
			
			if ($i != ($iterator_length - 1)){
				$json .= ',';
			}
		}
		
		$json .= "]";
		
		return $json;
	}


	
	
	function get_csv($pages_data){
		#print_r(getdate());
		#echo $pages_data;
		/*for($i = 0; $i < sizeof($pages); i++){
			echo pages_data[i]['title'];
		}*/
		$seconds_from_epoch = getdate();
		#echo (string)$seconds_from_epoch['0'];
		
		$csv_header = array('Date');
		
		$filename = "js/traffic_data_" . (string)$seconds_from_epoch['0'] . ".csv";
		
		$file = fopen($filename, "a");
		for($i = 0; $i < sizeof($pages_data); $i++){
			if($pages_data[$i]['title'] != ""){
				#echo $i;
				array_push($csv_header, $pages_data[$i]['title']);
			}
			
		}
		
		fputcsv($file, $csv_header);
		
		#echo sizeof($pages_data[0]['views_by_day']);
		for($i = 0; $i < sizeof($pages_data[0]['views_by_day']); $i++){
			
			
			$this_data_row = array($pages_data[0]['views_by_day'][$i][0]);
			
			for($j = 0; $j < sizeof($pages_data); $j++){
				if($pages_data[$j]['title'] != ""){
					array_push($this_data_row, $pages_data[$j]['views_by_day'][$i][1]);
				}
			}
			
			fputcsv($file, $this_data_row);
			
		}
		
		return $filename;
		
	}
	
}

?>