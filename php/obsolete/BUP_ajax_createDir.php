<?php
require('BUP_configurationLoader.php');
$config = loadConfiguration();
$dir = $config['REAL_UPLOAD_PATH'];

$newdir = $_POST['dirToCreate'];
if(!is_dir($dir.$newdir))
{
	if(mkdir($dir.$newdir))
		echo("SUCCESS!");
	else
		echo("Could not create directory.<br />".$newdir);
}else{
	echo("Directory already exists!");
}