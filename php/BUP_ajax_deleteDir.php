<?php
require('BUP_configurationLoader.php');
$config = loadConfiguration();
$dir = $config['REAL_UPLOAD_PATH'];

$dirtodelete = $_POST['itemToDelete'];

$rdir = $dir.$dirtodelete;

// From nbari at dalmp.com - found on the php manual.
// https://secure.php.net/manual/en/function.rmdir.php
function delTree($directory) 
{
	$files = array_diff(scandir($directory), array('.','..')); 
    foreach($files as $file) 
	{
		//echo("$directory/$file<br />");
    	(is_dir("$directory/$file")) ? delTree("$directory/$file") : unlink("$directory/$file"); 
    } 
    return rmdir($directory); 
}

if(delTree($rdir))
	echo("Deleted $rdir/");
else
	echo("Could not delete $rdir/");
?>