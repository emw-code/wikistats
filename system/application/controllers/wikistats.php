<?php
/*
wikistats.php

Copyright (c) 2012 Emw
Dual licensed under MIT and GPL licenses
*/

class Wikistats extends Controller {

	function Wikistats()
	{
		parent::Controller();	
		$this->load->model('Wikistats_model');
		$this->load->helper('url'); 
		//parse_str($_SERVER['QUERY_STRING'],$_GET);
	}
	
	function index()
	{
		$this->load->view('wikistats');
		
		//$data['page_views'] = $this->parse_url_parameters();
	}
	
	function infer_parseInfoBox($articleName){
		
		$useragent="Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6";
		
		$ch = curl_init(); // open curl session
		
		$query = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=" . $articleName . "&rvprop=content";
		// set curl options
		curl_setopt($ch, CURLOPT_URL, $query);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);    
		
		curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
		$data = curl_exec($ch); // execute curl session
		curl_close($ch); // close curl session
		
		preg_match('/\{\{Death date and age\|([^\}\}]*)/i', $data, $matches);
		//echo 'matches: ' . print_r($matches);
		
		if (sizeof($matches) == 0){
			return '';
		}
		
		$tmp = explode('|', $matches[1]);
		
		
		$date = '';
		$dateSegment = 0;
		
		for ($i = 0; $i < sizeof($tmp); $i++){
		
			$value = $tmp[$i];
		/*
			echo 'dateSegment = ' . $dateSegment;
			echo ' | value = ' . $value;
			echo ' | is_numeric(value) = ' . is_numeric($value);
			echo ' | "date" = ' . $date . '<br/>';*/
		
			if (is_numeric($value)){
				
				if (strlen($value) == 1) {$value = '0' . $value;}
				
				if ($dateSegment < 2){
					$date .= $value . '-';
				} else if ($dateSegment == 2){
					$date .= $value;
				}
				
				$dateSegment++;
			}
		}
		
		return $date;
	}
	
	function infer_InTheNews($articleName, $spikeDate){
		$useragent="Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6";
		
		$ch = curl_init(); // open curl session
		
		$tmp = explode('/', $spikeDate);
		
		$year = $tmp[2];
		$month = $tmp[0];
		$day = $tmp[1];
		$nextDay = $tmp[1] + 1;
		
		if (strlen($month) == 1) {$month = '0' . $month;}
		if (strlen($day) == 1) {$day = '0' . $day;}
		if (strlen($nextDay) == 1) {$nextDay = '0' . $nextDay;}
		
		$rvend = $year . $month . $day . '000000';
		$rvstart = $year . $month . $nextDay . '000000';
		
		$query = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Template:In_the_news&rvprop=content&rvstart=" . $rvstart . "&rvend=" . $rvend;
		// set curl options
		curl_setopt($ch, CURLOPT_URL, $query);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);    
		
		curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
		$data = curl_exec($ch); // execute curl session
		curl_close($ch); // close curl session
		
		$articleName = str_replace('_', ' ', $articleName);
		
		preg_match('/' . $articleName . '/', $data, $matches);
		if (sizeof($matches) > 0){
			return $year . '-' . $month . '-' . $day;
		} else {
			return '';
		}
	}
	
	
	function infer_DidYouKnow($articleName, $spikeDate){
		$useragent="Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6";
		
		$ch = curl_init(); // open curl session
		
		$tmp = explode('/', $spikeDate);
		
		$year = $tmp[2];
		$month = $tmp[0];
		$day = $tmp[1];
		$nextDay = $tmp[1] + 1;
		
		if (strlen($month) == 1) {$month = '0' . $month;}
		if (strlen($day) == 1) {$day = '0' . $day;}
		if (strlen($nextDay) == 1) {$nextDay = '0' . $nextDay;}
		
		$rvend = $year . $month . $day . '000000';
		$rvstart = $year . $month . $nextDay . '000000';
		
		$query = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Template:Did_you_know&rvprop=content&rvstart=" . $rvstart . "&rvend=" . $rvend;
		
		//echo $query;
		
		// set curl options
		curl_setopt($ch, CURLOPT_URL, $query);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);    
		
		curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
		$data = curl_exec($ch); // execute curl session
		curl_close($ch); // close curl session
		
		//echo $data;
		
		$articleName = str_replace('_', ' ', $articleName);
		
		preg_match('/' . $articleName . '/i', $data, $matches);
		if (sizeof($matches) > 0){
			return $year . '-' . $month . '-' . $day;
		} else {
			return '';
		}
	}
	
	function infer_OnThisDay($articleName, $spikeDate){
		$useragent="Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6";
		
		$ch = curl_init(); // open curl session
		
		$tmp = explode('/', $spikeDate);
		
		$year = $tmp[2];
		$month = $tmp[0];
		$day = $tmp[1];
		$nextDay = $tmp[1] + 1;
		$prevDay = $tmp[1] - 1;
		
		if (strlen($month) == 1) {$month = '0' . $month;}
		if (strlen($day) == 1) {$day = '0' . $day;}
		
		$monthName = date('F', mktime(0, 0, 0, $month, $day, $year));
		
		//echo $monthName;
		//echo $day;
		
		$rvend = $year . $month . $prevDay . '000000';
		$rvstart = $year . $month . $nextDay . '000000';
		
		$query = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Wikipedia:Selected_anniversaries/" . $monthName . "_" . $day ."&rvprop=content&rvstart=" . $rvstart . "&rvend=" . $rvend;
		
		//echo $query;
		
		// set curl options
		curl_setopt($ch, CURLOPT_URL, $query);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);    
		
		curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
		$data = curl_exec($ch); // execute curl session
		curl_close($ch); // close curl session
		
		//echo $data;
		
		$articleName = str_replace('_', ' ', $articleName);
		
		preg_match('/' . $articleName . '/', $data, $matches);
		if (sizeof($matches) > 0){
			return $year . '-' . $month . '-' . $day;
		} else {
			return '';
		}
	}
	
		
	function infer_TodaysFeaturedArticle($articleName, $spikeDate){
		$useragent="Mozilla/5.0 (Windows; U; Windows NT 6.1; en-US; rv:1.9.2) Gecko/20100115 Firefox/3.6";
		
		$ch = curl_init(); // open curl session
		
		$tmp = explode('/', $spikeDate);
		
		$year = $tmp[2];
		$month = $tmp[0];
		$day = $tmp[1];
		$nextDay = $tmp[1] + 1;
		$prevDay = $tmp[1] - 1;
		
		if (strlen($month) == 1) {$month = '0' . $month;}
		if (strlen($day) == 1) {$day = '0' . $day;}
		
		$monthName = date('F', mktime(0, 0, 0, $month, $day, $year));
		
		//echo $monthName;
		//echo $day;
		
		$rvstart = $year . $month . $day . '000000';
		
		$query = "http://en.wikipedia.org/w/api.php?action=query&prop=revisions&titles=Wikipedia:Today's_featured_article/" . $monthName . "_" . $tmp[1] . ",_" . $year . "&rvprop=content&rvstart=" . $rvstart;
		
		//echo $query;
		
		// set curl options
		curl_setopt($ch, CURLOPT_URL, $query);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);    
		
		curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
		$data = curl_exec($ch); // execute curl session
		curl_close($ch); // close curl session
		
		//echo $data;
		
		$articleName = str_replace('_', ' ', $articleName);
		
		preg_match('/' . $articleName . '/', $data, $matches);
		if (sizeof($matches) > 0){
			return $year . '-' . $month . '-' . $day;
		} else {
			return '';
		}
	}
	
	
	function infer(){
		
		$articleName = $this->input->get('articleName');
		$spikeDate = $this->input->get('date');
		
		$deathDate = $this->infer_parseInfoBox($articleName);
		$inTheNewsDate = $this->infer_InTheNews($articleName, $spikeDate);
		$onThisDayDate = $this->infer_OnThisDay($articleName, $spikeDate);
		$todaysFeaturedArticleDate = $this->infer_TodaysFeaturedArticle($articleName, $spikeDate);
		$didYouKnowDate = $this->infer_DidYouKnow($articleName, $spikeDate);
		
		
		$inference = array();
		
		if ($deathDate != '') {
			$cause1 = array();
			$cause1["cause"] = "Died";
			$cause1["date"] = $deathDate;
			
			array_push($inference, $cause1);
		}
		
		if ($inTheNewsDate != '') {
			$cause2 = array();
			$cause2["cause"] = "Appeared in the \"In the News\" section of Main Page";
			$cause2["date"] = $inTheNewsDate;
			
			array_push($inference, $cause2);
		}
		
		if ($onThisDayDate != '') {
			$cause3 = array();
			$cause3["cause"] = "Appeared in \"On this Day\" section of Main Page";
			$cause3["date"] = $onThisDayDate;
			
			array_push($inference, $cause3);
		}
		
		if ($todaysFeaturedArticleDate != '') {
			$cause4 = array();
			$cause4["cause"] = "Appeared in \"Today's Featured Article\" section of Main Page";
			$cause4["date"] = $todaysFeaturedArticleDate;
			
			array_push($inference, $cause4);
		}
		
		if ($didYouKnowDate != '') {
			$cause5 = array();
			$cause5["cause"] = "Appeared in \"Did You Know?\" section of Main Page";
			$cause5["date"] = $didYouKnowDate;
			
			array_push($inference, $cause5);
		}
		
		echo json_encode($inference);
	}
	
	function parse_url_parameters(){
	
		$project1 = $this->input->get('project1');
		$project2 = $this->input->get('project2');
		$project3 = $this->input->get('project3');
		
		$p1 = $this->input->get('p1');
		$p2 = $this->input->get('p2');
		$p3 = $this->input->get('p3');
		
		$projects = array($project1);
		if ($project2 != ''){
			array_push($projects, $project2);
			if ($project3 != ''){
				array_push($projects, $project3);
			}
		}
		$pages = array($p1);
		if ($p2 != ''){
			array_push($pages, $p2);
			if ($p3 != ''){
				array_push($pages, $p3);
			}
		}
		
		$from_date = $this->input->get('from');
		$to_date = $this->input->get('to');
		
		#Converts date format from DD/MM/YYYY to YYYY-MM-DD
		$exploded_from = explode("/", $from_date);
		$from_date = $exploded_from[2] . "-" . $exploded_from[0] . "-" . $exploded_from[1];
		$exploded_to = explode("/", $to_date);
		$to_date = $exploded_to[2] . "-" . $exploded_to[0] . "-" . $exploded_to[1];
		
		$data_type = $this->input->get('dataType');
		
		$url_params = array('projects' => $projects, 'pages' => $pages, 'to_date' => $to_date, 'from_date' => $from_date, 'data_type' => $data_type);
		return $url_params;
	}
	
	function get_traffic_data()
	{
		$time_begin = microtime(true);
		$url_params = $this->parse_url_parameters();
		$projects = $url_params['projects'];
		$pages = $url_params['pages'];
		$from_date = $url_params['from_date'];
		$to_date = $url_params['to_date'];
		$data_type = $url_params['data_type'];
		
		#echo 'test';
		#echo sizeof($projects);
		
		$time_begin_1 = microtime(true);
		$cpe_return = $this->Wikistats_model->check_page_existence($projects, $pages);
		$check_page_existence_time = microtime(true) - $time_begin_1;
		
		$nonexistent_pages = $cpe_return[0];
		$existing_pages = $cpe_return[1];
		$timing = $cpe_return[2];
		
		$json = '';
		$json .= '{"fromDate": "' . $from_date . '", "toDate": "' . $to_date . '", ';
		
		if (sizeof($nonexistent_pages) == 0){
			$json .= ' "nonexistent_pages": [], ';
		} else {
			$json .= ' "nonexistent_pages": ["';
			
			
			foreach($nonexistent_pages as $project => $page){
				$json .= '{"project": "' . $project . '", "page": "' . $page . '"}\', \'';
			}
			
			// Remove last character (a comma) from nonexistent_pages
			$json = substr($json,0,-4); 
			$json .= "'], ";
		}
		//$json .= " nonexistent_pages: '" .  implode(', ', $nonexistent_pages) . "', ";
		//print_r($existing_pages);
		$time_begin_2 = microtime(true);
		$json .= $this->Wikistats_model->get_by_range_json($existing_pages, $from_date, $to_date);
		$get_by_range_json_time = microtime(true) - $time_begin_2;
		
		
		$time_end = microtime(true);
		$get_traffic_data_time = $time_end - $time_begin;

		//ar_dump($timing);
		$timing_json = json_encode($timing);
		//var_dump($timing_json);
		
		$json .= ', ' .
			'"timing": {' .
				'"get_traffic_data()": {' . 
					'"time" : ' . $get_traffic_data_time . ', ' .
					'"children": {' .
						'"check_page_existence()": {' .
							'"time": ' . $check_page_existence_time . ' , ' .
							'"children": ' . $timing_json . 
						'}, ' .
						'"get_by_range_json()": {' .
							'"time": ' . $get_by_range_json_time .
						'}' .
					'}' .
				'}' .
			'}';
			
		$json .= "}";

		echo $json;
		//echo $existing_pages[0];
		//echo $return_array[1][0];
		
	}
	
}
