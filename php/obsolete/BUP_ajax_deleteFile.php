<?php
require('BUP_configurationLoader.php');
$config = loadConfiguration();
$dir = $config['REAL_UPLOAD_PATH'];

$filetodelete = $_POST['itemToDelete'];

if(unlink($dir.$filetodelete))
	echo "Successfully deleted file.";
else
	echo "ERROR: Could not delete $filetodelete!";

?>