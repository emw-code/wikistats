<html>
<head>
	<script type="text/javascript" src="<?php echo base_url();?>js/jquery/jquery-1.2.3.min.js"></script>
	<script type="text/javascript" src="<?php echo base_url();?>js/jquery/jquery.tablesorter.js"></script>
	
	<script language="javascript" type="text/javascript" src="<?php echo base_url();?>js/rawdata.js"></script>
	
	<link type="text/css" href="<?php echo base_url();?>css/tablesorter.css" rel="stylesheet" />
	
</head>
<body>
<title>Raw Wikipedia article traffic data</title>
<table id="raw_data" class="tablesorter" border="0" cellpadding="0" cellspacing="1"	>
<?php

/*
 echo '<a href=' . base_url() . $csv_file . '>Download CSV</a>';
$p2_set = FALSE;
$p3_set = FALSE;
$num_pages_set = 1;


if($pages_data[1]['title'] != ''){
	$p2_set = TRUE;
}

if($pages_data[2]['title'] != ''){
	$p3_set = TRUE;
}

if($p2_set and !$p3_set){
	$num_pages_set = 2;
}

if($p2_set and $p3_set){
	$num_pages_set = 3;
}

echo '	<thead>
		<tr><th>Date</th>';
for ($i = 0; $i < $num_pages_set; $i++){
	echo '<th>' . $pages_data[$i]['title'] . '</th>';
}
echo '
	</tr></thead>';


echo '
	<tbody>
		';
$num_of_days = sizeof($pages_data[0]['views_by_day']);
for ($i = 0; $i < $num_of_days; $i++){
	echo '<tr><td>' . $pages_data[0]['views_by_day'][$i][0] . '</td><td>' . $pages_data[0]['views_by_day'][$i][1] . '</td>';
	if ($p2_set){
		echo '<td>' . $pages_data[1]['views_by_day'][$i][1] . '</td>';
	}
	if ($p3_set){
		echo '<td>' . $pages_data[2]['views_by_day'][$i][1] . '</td>';
	}
	echo '</tr>
		';
}

echo '</tbody>
';
*/
?>
</table>
</body>
</html>
