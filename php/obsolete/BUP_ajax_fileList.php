<?php
require('BUP_configurationLoader.php');
$config = loadConfiguration();

$relative_file_directory=$config["UPLOAD_PATH_FROM_PHPDIR"];	// '../../UPLOADS/';
$relative_root_directory=$config["UPLOAD_PATH_FROM_HTMLDIR"];	// 'UPLOADS/';

$actualdirectory = $_POST['actualdir'];
if(!$actualdirectory)
	$actualdirectory='';

$result = [];
$result['directory'] = $relative_root_directory;
$result['actualdir'] = $actualdirectory;

if(strlen($actualdirectory)>0)
	$actualdirectory.="/";

$reldir = $relative_file_directory.$actualdirectory;
$dirs=[];
foreach(glob($reldir.'*', GLOB_ONLYDIR) as $d)
{
	$fn=str_replace($reldir,'',$d);
	$dirs[] = $fn;
}
$result['dirs']=$dirs;
//$result['reldir']=$reldir;

$filenames = [];
foreach(array_filter(glob($reldir.'*.*'), 'is_file') as $file)
{
	$farray = [];
	$fn=str_replace($reldir,'',$file);

	$f=filesize($file);
	$fe="bytes";
	if($f/1024 > 1)
	{
		$f/=1024;
		$fe="kb";
		if($f/1024 > 1)
		{
			$f/=1024;
			$fe="Mb";
			if($f/1024 > 1)
			{
				$f/=1024;
				$fe="GB";
			}
		}
	}

	$farray['Filename'] = $fn;
	$farray['Filesize'] = number_format($f,1);
	$farray['FilesizeDeterminant'] = $fe;

	$filenames[] = $farray;
}
$result['files']=$filenames;

header('Content-Type: application/json');
echo(json_encode($result));
