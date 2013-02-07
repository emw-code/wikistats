<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<!--
Copyright (c) 2012 Emw
Dual licensed under MIT and GPL licenses

This site does not degrade gracefully for users without Javascript.
-->
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
	<title>Wikipedia article traffic statistics</title>
	
	<link type="text/css" href="http://toolserver.org/~emw/css/smoothness/jquery-ui-1.7.2.custom.css" rel="stylesheet" />
	<link type="text/css" href="http://toolserver.org/~emw/css/wikistats_custom.css" rel="stylesheet" />
	<link rel="shortcut icon" type="image/x-icon" href="css/favicon.ico"/>
	<!-- Internet Explorer doesn't yet support the 'canvas' element, which is part of HTML 5; excanvas.min.js is a workaround -->
	<!--[if IE]>
	<link type="text/css" href="css/smoothness/jquery-ui-1.7.3.custom.css" rel="stylesheet" />
	<script language="javascript" type="text/javascript" src="http://toolserver.org/~emw/js/flot/excanvas.min.js"></script>	
	<![endif]-->

	<!-- The 'Flot' jQuery library is being used to plot data -->
	<script language="javascript" type="text/javascript" src="<?php echo base_url(); ?>js/flot/jquery.js"></script>
	<script language="javascript" type="text/javascript" src="http://toolserver.org/~emw/js/jquery/js/jquery-ui-1.7.2.custom.min.js"></script>
	<script language="javascript" type="text/javascript" src="http://toolserver.org/~emw/js/flot/jquery.flot.js"></script>
	<script language="javascript" type="text/javascript" src="http://toolserver.org/~emw/js/flot/jquery.flot.navigate.js"></script>
	
	<!-- 'stat_summary' is a plugin made specifically for this tool.  It plots the 66% confidence interval (mean +/- 1 sd) for data. -->
	<script language="javascript" type="text/javascript" src="http://toolserver.org/~emw/js/flot/jquery.flot.stat_summary.js"></script>
	
	<!-- wikistats.js contains the bulk of code responsible for the behavior of this tool -->
	<script type="text/javascript" src="http://toolserver.org/~emw/js/datepicker.js"></script>
	<script type="text/javascript" src="http://toolserver.org/~emw/js/comma.js"></script>
	<script type="text/javascript" src="http://toolserver.org/~emw/js/wikistats.js"></script>
	<script type="text/javascript" src="http://toolserver.org/~emw/js/buttons.js"></script>
 </head>
    <body>
    <div id="header">Wikipedia article traffic statistics <span style="font-size: 14px;">(alpha)</span>
	   <div style="font-size: 14px;">A tool to visualize how viewership of Wikipedia articles has changed over time</div>
   </div>
	<div id="page_set">
		<label id="page_label" for="Page">Page</label>
		<span id="page_inputs">
			<input class="dataSeries page" type="text" size="30" id="p1" name="p1" value=""/>
		</span>
		<button id="subtract_page" class="ui-state-default" style="display:none"><b>-</b></button><button id="add_page"class="ui-state-default"><b>+</b></button>
	</div>
	<div id="project_container">
		<span id="project_label">Project</span>
		<select class='dataSeries project' id="project1" name="project1">
			<option value="en">English</option><option value="de" >German</option><option value="fr" >French</option><option value="pl" >Polish</option><option value="ja" >Japanese</option><option value="it" >Italian</option><option value="nl" >Dutch</option><option value="pt" >Portuguese</option><option value="es" >Spanish</option><option value="sv" >Swedish</option><option value="ru" >Russian</option><option value="zh" >Chinese</option><option value="zh-classical" >Chinese (classical)</option><option value="no" >Norwegian</option><option value="fi" >Finnish</option><option value="vo" >Volap�k</option><option value="ca" >Catalan</option><option value="ro" >Romanian</option><option value="tr" >Turkish</option><option value="uk" >Ukrainian</option><option value="eo" >Esperanto</option><option value="cs" >Czech</option><option value="hu" >Hungarian</option><option value="sk" >Slovak</option><option value="da" >Danish</option><option value="id" >Indonesian</option><option value="he" >Hebrew</option><option value="lt" >Lithuanian</option><option value="sr" >Serbian</option><option value="sl" >Slovenian</option><option value="ar" >Arabic</option><option value="ko" >Korean</option><option value="bg" >Bulgarian</option><option value="et" >Estonian</option><option value="new" >Newar / Nepal Bhasa</option><option value="hr" >Croatian</option><option value="te" >Telugu</option><option value="ceb" >Cebuano</option><option value="gl" >Galician</option><option value="th" >Thai</option><option value="el" >Greek</option><option value="fa" >Persian</option><option value="vi" >Vietnamese</option><option value="nn" >Norwegian (Nynorsk)</option><option value="ms" >Malay</option><option value="simple" >Simple English</option><option value="eu" >Basque</option><option value="bpy" >Bishnupriya Manipuri</option><option value="bs" >Bosnian</option><option value="lb" >Luxembourgish</option><option value="ka" >Georgian</option><option value="is" >Icelandic</option><option value="sq" >Albanian</option><option value="br" >Breton</option><option value="la" >Latin</option><option value="az" >Azeri</option><option value="bn" >Bengali</option><option value="hi" >Hindi</option><option value="mr" >Marathi</option><option value="tl" >Tagalog</option><option value="mk" >Macedonian</option><option value="sh" >Serbo-Croatian</option><option value="io" >Ido</option><option value="cy" >Welsh</option><option value="pms" >Piedmontese</option><option value="su" >Sundanese</option><option value="lv" >Latvian</option><option value="ta" >Tamil</option><option value="nap" >Neapolitan</option><option value="jv" >Javanese</option><option value="ht" >Haitian</option><option value="nds" >Low Saxon</option><option value="scn" >Sicilian</option><option value="oc" >Occitan</option><option value="ast" >Asturian</option><option value="ku" >Kurdish</option><option value="hy" >Armenian</option><option value="af" >Afrikaans</option><option value="commons.m" >Commons</option><option value="meta.m">Meta</option></select>
		</select>
		<button id="subtract_project" class="ui-state-default" style="display:none"><b>-</b></button><button id="add_project"class="ui-state-default"><b>+</b></button>
	</div>
	<div id="to_from" style="position:relative; top:5px;">
		<!--<select style="display:none" class='dataSeries' id="project" name="project"><option value="en" >English</option></select>-->
		<label for="from">From</label>
		<input type="text" id="from" name="from" size="10" class="dataSeries"/>
		<label for="to">to</label>
		<input type="text" id="to" name="to"  size="10" class="dataSeries"/>
		<button id="go_button" class="ui-state-default">Go</button>
		<span id="wait_notice"></span>
		<span id="notice"></span>
	</div>
	
	<div id="placeholder" style="position:relative; top:10px; width:700px;height:350px;"></div>
	<!--<div id="miniature" style="position:absolute;top:163px;left:718px;">
		<div id="overview" style="width:166px;height:100px"></div>

		<p id="overviewLegend" style="margin-left:10px"></p>
	</div>-->
	<div id="cavaet" style="display:none">
		<span id="truncated_mean">
		<span style="color:red">*</span> Days with zero views were ignored when <br/>computing average and standard deviation.</span>
	</div>
	<div id="info" style="display:none">
		<span id="usage_notes">
		- Mouse over individual points to see number of views on that day.<br/>
		- Click on rows in legend to plot average (red) views and standard deviation (blue).<br/>
		- To zoom in, double click.  To zoom out, hold down Shift while double clicking.<br/>
		- Pan by clicking and dragging.<br/>
		</span>
	</div>

	<div id="attribution" style="position:absolute; top:520px; font-size: 12px;">Page view data taken from <a href="http://stats.grok.se/en/201003/Main_Page">Henrik's tool</a>.  Send any comments or questions to <a href="http://en.wikipedia.org/wiki/User:Emw">User:Emw</a>.

 </body>
</html>
