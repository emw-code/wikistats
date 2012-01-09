<?php
/*
rawdata.php

Copyright (c) 2012 Emw
Dual licensed under MIT and GPL licenses
*/

class Rawdata extends Controller {

	function Rawdata()
	{
		parent::Controller();	
		$this->load->model('Wikistats_model');
		$this->load->helper('url'); 
		//echo "parse_str($_SERVER['QUERY_STRING'],$_GET) = " . parse_str($_SERVER['QUERY_STRING'],$_GET);
	}
	
	function index()
	{
	
		//$data['pages_data'] = $this->get_traffic_data();
		//$data['csv_file'] = $this->Wikistats_model->get_csv($data['pages_data']);
		$this->load->view('rawdata');
		#$this->load->view('csv', $data);
	}
	
	function parse_url_parameters(){
	
		$project1 = $this->input->get('project1');
		$project2 = $this->input->get('project2');
		$project3 = $this->input->get('project3');
		
		$p1 = $this->input->get('p1');
		$p2 = $this->input->get('p2');
		$p3 = $this->input->get('p3');
		
		//echo 'p1 = ' . $p1;
		
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
		
		//echo $from_date;
		
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
	
	function getJSON($projects, $pages, $from_date, $to_date, $data_type)
	{
		$cpe_return = $this->Wikistats_model->check_page_existence($projects, $pages);
		
		$nonexistent_pages = $cpe_return[0];
		$existing_pages = $cpe_return[1];
		
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
			$json .= '"], ';
		}
		//$json .= " nonexistent_pages: '" .  implode(', ', $nonexistent_pages) . "', ";
		//print_r($existing_pages);
		$json .= $this->Wikistats_model->get_by_range_json($existing_pages, $from_date, $to_date);
		
		$json .= "}";
		
		return $json;
	}
	
	function get_traffic_data()
	{
		
		$url_params = $this->parse_url_parameters();
		$projects = $url_params['projects'];
		$pages = $url_params['pages'];
		$from_date = $url_params['from_date'];
		$to_date = $url_params['to_date'];
		$data_type = $url_params['data_type'];
		
		$json = $this->getJSON($projects, $pages, $from_date, $to_date, $data_type);
		
		$filename = $this->get_csv($json);
		
		$json = json_decode($json, true);
		$json["csv_file"] = $filename;
		$json = json_encode($json);
		
		echo $json;
		//echo $existing_pages[0];
		//echo $return_array[1][0];
		
	}
	
	
	function get_csv($json) 
	{
		
		$url_params = $this->parse_url_parameters();
		$projects = $url_params['projects'];
		$pages = $url_params['pages'];
		$from_date = $url_params['from_date'];
		$to_date = $url_params['to_date'];
		$data_type = $url_params['data_type'];
		
		//var_dump($json);
		
		if (is_null($json)) {
			$json = $this->getJSON($projects, $pages, $from_date, $to_date, $data_type);
		}
		
		
		$json = json_decode($json, true);
		
		$seconds_from_epoch = getdate();
		#echo (string)$seconds_from_epoch['0'];
		
		$csv_header = array('Date');
				
		$filename = "csv/traffic_data_" . (string)$seconds_from_epoch['0'] . ".csv";
		
		$file = fopen($filename, "a");
		
		//echo 'sizeof($json["groups"][0] = ' . sizeof($json["groups"][0];
		
		for($i = 0; $i < sizeof($json["groups"]); $i++){
			
			$group = $json["groups"][$i];
			
			if($group['page'] != ""){
				array_push($csv_header, $group['project'] . " " . $group['page']);
			}
			
		}
		
		fputcsv($file, $csv_header);
		
		#echo sizeof($pages_data[0]['views_by_day']);
		
		$trafficData = $json["groups"][0]['trafficData'];
		
		
		for($i = 0; $i < sizeof($trafficData); $i++){
			$this_data_row = array($trafficData[$i][0]);
			for($j = 0; $j < sizeof($json["groups"]); $j++){
				$group = $json["groups"][$j];
				array_push($this_data_row, $group["trafficData"][$i][1]);
			}
			fputcsv($file, $this_data_row);
		}
		
		return "/~emw/" . $filename;
		
	}
}
