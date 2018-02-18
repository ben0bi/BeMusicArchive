<!DOCTYPE html>
<?php
	// type here the sha1 password string, lowercase.
	$mypass="60be8d1e414caefe9426e3cb175b22faa3c119ab";
	//$mypass="e2d09789b0bc36caf4a214c138d95003a90fd444"; // old pass..

	function showPWField($wrongpass)
	{
		// SHOW sha1 of password. Uncomment after you set it.
		//if(isset($_POST['pass']))
		//	echo(sha1($_POST['pass']));

		$url = "index.php";
		// carry on the get parameters.
		$flags = 0;
		if(isset($_GET['enabledeletion']) || isset($_GET['renamefile']))
			$url.='?';
		if(isset($_GET['enabledeletion']))
		{
			$url.='enabledeletion';
			$flags++;
		}
		if(isset($_GET['renamefile']))
		{
			if($flags>=1)
				$url.='&';
			$url.='renamefile';
		}		
		$txt='<div style="display: table; position: absolute; width: 100%; height: 100%;">';
		$txt.='<div style="display: table-cell; vertical-align: middle;">';
		$txt.='<div id="pwfield"><form action="'.$url.'" method="POST">';
		$txt.='<nobr>';
		if($wrongpass==true)
			$txt.="(N0pe!) ";
		$txt.='Password:<br />';
		$txt.='<input type="password" id="pass" name="pass" autofocus/>';
		$txt.='<input type="submit" value="go" /></nobr>';
		$txt.='</form></div></div></div>';
		$txt.='<div style="position:absolute; width: 100%; bottom: 5px; text-align: center; font-family: sans-serif; font-size: 10pt;">'; // hardcoded copyright. Deletion not allowed. 
		$txt.='by ben0bi in 2017 & 2018 | <a href="http://ben0bi.dlinkddns.com">ben0bi.dlinkddns.com</a>'; // hardcoded copyright. Deletion not allowed. 
		$txt.='</div>';
				
		echo($txt);
	}

	function showPage() {include('archive.page');}

	function showContent()
	{
		global $mypass;
		if(isset($_POST['pass']))
		{
			if(sha1($_POST['pass'])==$mypass)
				showPage();
			else
				showPWField(true);
		}else{
			showPWField(false);
		}
	}
?>
<html>
	<head>
		<title>ben0bis Music Archive</title>
		<meta charset="UTF-8" />
		<link type="text/css" rel="stylesheet" href="css/ben0biUploader.css" />
		<style>
			html, body {padding: 0; margin: 0; width: 100%; height: 100%;}
			#buploader {width: 300px;}
			#pwfield 
			{
				margin: 0 auto; width: 300px; 
				text-align: center;
				font-family: monospace;
				font-size: 14;
			}
		</style>
		<meta charset="UTF-8" />
	</head>
	<body>
		<?php showContent(); ?>
	</body>
</html>