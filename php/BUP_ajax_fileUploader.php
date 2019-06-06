<?php
require('BUP_configurationLoader.php');
$config = loadConfiguration();
$dir = $config['REAL_UPLOAD_PATH'];

function upload($fulldir)
{
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
					if(!move_uploaded_file($_FILES[$inputname]['tmp_name'],"$fulldir".$actualdir.$_FILES[$inputname]['name']))
					{
			  			$text="@!err!@<span class='error'>Error while moving ".$_FILES[$inputname]['name']." to the upload directory.</span>";
						$err = 1;
					}else{
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

// upload the file
upload($dir);

?>
