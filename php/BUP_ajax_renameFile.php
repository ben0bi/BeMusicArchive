<?php
require('BUP_configurationLoader.php');
$config = loadConfiguration();
$dir = $config['REAL_UPLOAD_PATH'];

$filetorename = $_POST['fileToRename'];
$newfilename = $_POST['newRenamedFileName'];

//$dir= '/var/www/html/UPLOADS/';

if(rename($dir.$filetorename, $dir.$newfilename))
	echo "Successfully renamed file.";
else
	echo "ERROR: Could not rename $filetorename to $newfilename!";

?>