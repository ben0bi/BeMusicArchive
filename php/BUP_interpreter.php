<?php

// All-in-One File.
// By Oki Wan Ben0bi @ 2018
// ben0bi.dlinkddns.com
// twitter.com/ben0bi

//require('BUP_configurationLoader.php');
function loadConfiguration()
{
	// change this path if the config file is somewhere else.
	// seen from the php files folder.
	$configPath = "./../config/pageconfig.json";

	$string = file_get_contents($configPath);
	$json_a = json_decode($string, true);
	return $json_a;
}
$config = loadConfiguration();

// used for most everything.
$g_dir = $config['REAL_UPLOAD_PATH'];

// used for filelist.
$g_relative_file_directory=$config["UPLOAD_PATH_FROM_PHPDIR"];	// '../../UPLOADS/';
$g_relative_root_directory=$config["UPLOAD_PATH_FROM_HTMLDIR"];	// 'UPLOADS/';

// get the command.
$what=null;
if(isset($_POST['command']))
	$what = $_POST['command'];

if($what==null)
{
	echo("Interpreter: No command given.");
	return;
}

// ***************************************************** COMMANDS

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

// The class with all the file functions.
class BUP
{
	// makedir command.
	public static function makedir()
	{
		global $g_dir;
		$newdir = $_POST['dirToCreate'];
		if(!is_dir($g_dir.$newdir))
		{
			if(mkdir($g_dir.$newdir))
			{
				chmod($g_dir.$newdir, 0777);
				chgrp($g_dir.$newdir,"www-data");
				chown($g_dir.$newdir,"www-data");
				echo("SUCCESS!<br />Created directory $newdir/");
			}else{
				echo("Could not create directory.<br />$newdir/");
			}
		}else{
			echo("Directory already exists!");
		}
	}

	// remove a directory.
	public static function removedir()
	{
		global $g_dir;
		$dirtodelete = $_POST['itemToDelete'];
		$rdir = $g_dir.$dirtodelete;

		if(delTree($rdir))
			echo("Deleted $rdir/");
		else
			echo("Could not delete $rdir/");
	}

	// remove a file
	public static function removefile()
	{
		global $g_dir;
		$filetodelete = $_POST['itemToDelete'];

		if(unlink($g_dir.$filetodelete))
			echo "Successfully deleted file:<br />$filetodelete";
		else
			echo "ERROR: Could not delete $filetodelete!";
	}

	// return a list with files and directories.
	public static function filelist()
	{
		global $g_relative_file_directory;	// '../../UPLOADS/';
		global $g_relative_root_directory;	// 'UPLOADS/';

		$actualdirectory = $_POST['actualdir'];
		if(!$actualdirectory)
			$actualdirectory='';

		$result = [];
		$result['directory'] = $g_relative_root_directory;
		$result['actualdir'] = $actualdirectory;

		if(strlen($actualdirectory)>0)
			$actualdirectory.="/";

		$reldir = $g_relative_file_directory.$actualdirectory;
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
	}

	// upload a file
	public static function uploadfile()
	{
		global $g_dir;
		$inputname="uploadFile";
		$dirinputname = "uploader_actualdir";
		// set this directory, no slash at end.!
		//$fulldir = "/var/www/html/UPLOADS";
		$text = "@!err!@File upload failed.";

		$actualdir = $_POST[$dirinputname];
		if($actualdir!="@not_set" && strlen($actualdir)>0)
			$actualdir.="/";
		else
			$actualdir="";

		$err = 0;
		if(isset($_FILES[$inputname]['tmp_name']))
		{
			$fname=$_FILES[$inputname]['name'];
			$fulldir = $g_dir.$actualdir.$_FILES[$inputname]['name'];
			// check if empty filename
			if($fname!="")
			{
				// forbidden files 1 (php)
				$fileend=substr(strtolower($fname),strlen($fname)-4,4);
				if($fileend!=".php")
				{
					// forbidden files 2 - images
					if($fileend!=".jpg" && $fileend!="jpeg" && $fileend!=".png" && $fileend!=".gif" && $fileend!=".svg")
					{
						//formular gesendet
						if(!move_uploaded_file($_FILES[$inputname]['tmp_name'],$fulldir))
						{
			  				$text="@!err!@<span class='error'>Error while moving ".$_FILES[$inputname]['name']." to the upload directory.</span>";
							$err = 1;
						}else{
							chmod($fulldir, 0777);
							chgrp($fulldir, "www-data");
							chown($fulldir, "www-data");
							$text="File ".$_FILES[$inputname]['name']. " uploaded.";
						}
					}else{
						$text="@!err!@<span class='error'>This server is not here for your shitty pr0n images.</span>";
					}
				}else{
					$text="@!err!@<span class='error'>Uploading of PHP-files not allowed.</span>";
				}
			}else{
				$text="@!err!@<span class='error'>Please select a file first.</span>";
			}
		}else{
			$text = "@!err!@No File given for uploading.";
			$err = 1;
		}

		if($err >= 1)
		{
			$text = $text.'<br /><br /><pre>';
			$text = $text.'Here is some more debugging info:';
			$text = $text.print_r($_FILES, true);
			$text=$text."</pre>";
		}

		echo($text);
		return $text;
	}

	// rename a file or a directory.
	public static function renamefile()
	{
		global $g_dir;
		$filetorename = $_POST['fileToRename'];
		$newfilename = $_POST['newRenamedFileName'];

		//$dir= '/var/www/html/UPLOADS/';

		if(rename($g_dir.$filetorename, $g_dir.$newfilename))
			echo("Successfully renamed $filetorename to $newfilename!");
		else
			echo("ERROR: Could not rename $filetorename to $newfilename!");
	}
}
// ***************************************************** INTERPRETER

switch($what)
{
	case "mkdir": BUP::makedir(); break;
	case "rmdir": BUP::removedir(); break;
	case "rmfile": BUP::removefile(); break;
	case "list": BUP::filelist(); break;
	case "upload": BUP::uploadfile(); break;
	case "rename": BUP::renamefile(); break;
	default: echo("Interpreter: Command not found."); break;
}

?>
