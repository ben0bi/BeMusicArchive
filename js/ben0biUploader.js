/* The Ben0bi Uploader

	You can actually just use it for one uploader at a time now.

	Needs the php files BUP_ajax_fileList.php and BUP_ajax_fileUploader.php
	Also the files BUP_ajax_renameFile.php and BUP_ajax_deleteFile.php
	if you want to rename or delete files.

	BUP.phpDir is the relative path to your php directory.
	uploaderDivId is the div where the upload input and submit button appears.
	filelistDivId is the div where the file list should be displayed.

	Needs jQuery.
	Needs ben0biFuncs.js

	v2 - with directories.
*/
var g_version = "v2.6";

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// configfile directory
// var BUPConfigDirectory = 'config/pageconfig.json';
// config does not work as wanted so I put the real path here.
var g_phpDir="php/";

/* The Ben0bi UPloader */
var BUP = function(uploaderDivId, fileListDivId, enablerenaming, enabledeletion, afterProcessFunc)
{
	var m_upDivId = uploaderDivId;
	var m_listDivId = fileListDivId;
	var m_enableDeletionOfFiles = enabledeletion;
	var m_enableRenamingOfFiles = enablerenaming;
	var m_actualdir = '';

	this.setEnableDeletion=function(enable) {if(enable) m_enableDeletionOfFiles=1; else m_enableDeletionOfFiles=0;};
	this.setEnableRenaming=function(enable) {if(enable) m_enableRenamingOfFiles=1; else m_enableRenamingOfFiles=0;};

	// set the flags first.
	this.setEnableDeletion(enabledeletion);
	this.setEnableRenaming(enablerenaming);

	// handle progress of uploading.
	var m_uploadprogressbar=null;
	var m_uploadprogressborder= null;

	/* this function is called after every step you make which can affect the layout. */
	var m_afterProcessFunction = null;
	if(afterProcessFunc)
		m_afterProcessFunction=afterProcessFunc;

	this.getFiles = function(dir = '')
	{
		// maybe set actual dir.
		if(dir == '?dir?')
			dir = m_actualdir;
		getFiles_intern(dir);
	};

	// get the files in a directory and show their names.
	var getFiles_intern = function(actdir = '')
	{
		hideResult();
		var fileDisplay=$('#'+m_listDivId);
		fileDisplay.html("Bitte warten..");
		var isNotEmpty = 0;

		$.ajax({
			url: BUP.phpDir+'BUP_interpreter.php',
			method: 'POST',
			dataType: 'text',
			data: {command: 'list', actualdir: actdir},
			success: function (data)
			{
				var json = JSON.parse(data);
				// TODO: remove rootDir
				var rootDir=json['directory'];
				//var relDir=json['reldir'];
				m_actualdir=json['actualdir'];
				var adir = m_actualdir;
				if(adir.length>0)
					adir+="/";
				console.log("Actual directory: "+m_actualdir);
				// show actual directory
				var result = "<span id='BUPactualDirectory'>Actual dir: /"+adir+"</span><br />";	
				// show sub directories
				result += '<table border="0" style="width: 100%;">';
				// first show back directory.
				if(m_actualdir.length>0)
				{
					result+='<tr style="max-width: 100%" class="filelist_dirname filefont">';
					result+='<td class="BUP_tdminwidth">&#128072;&nbsp;</td>';
					result+='<td class="BUP_tdmaxwidth filelist_dirname filefont" colspan="2">';
					result+='<a href="javascript:" class="button_goback_reconfig">../</a></td>';
					result+='</tr>';
				}

				// show the directories.
				for(var i=0;i<json['dirs'].length;i++)
				{
					var dir = json['dirs'][i];
					var deletedir = dir;
					if(m_actualdir.length>0)
						deletedir = m_actualdir+'/'+dir;

					result+='<tr style="max-width: 100%" class="filelist_dirname filefont">';

					// show delete link for dir.
					if(m_enableDeletionOfFiles>0)
					{
						result+='<td class="BUP_tdminwidth filelist_dirname filefont">';
						// its deleteFILEbutton because of the looks, not a special deleteDIRbutton.
						result+='<a href="javascript:" data-dirname="'+deletedir+'" class="deleteFileButton button_initiateDeleteDir_reconfig"><span class="deleteFileButtonContent"></span></a>';
						result+='</td>';
					}

					// show rename link for dir.
					if(m_enableRenamingOfFiles>0)
					{
						var fndir = '';
						if(m_actualdir!='')
							fndir=m_actualdir+"/";
						result+='<td class="BUP_tdminwidth filelist_filename filefont">';
						result+='<a href="javascript:" data-isdir="1" data-filename="'+dir+'" data-filedir="'+fndir+'" class="renameFileButton button_initiateRename_reconfig"><span class="renameFileButtonContent"></span></a>';
						result+='</td>';
					}

					result+='<td class="BUP_tdminwidth">&#128193;&nbsp;</td>';
					result+='<td class="BUP_tdmaxwidth filelist_dirname filefont" colspan="2">';
					result+='<a href="javascript:" class="button_changeDir_reconfig" data-dirname="'+dir+'">'+dir+'/</a></td>';
					result+='</tr>';
					isNotEmpty++;
				}

				// show files
				for(var i=0;i<json['files'].length;i++)
				{
					var fn = json['files'][i]['Filename'];
					var fndir = '';
					if(m_actualdir!='')
						fndir=m_actualdir+"/";
					var fs = json['files'][i]['Filesize'];
					var fsd = json['files'][i]['FilesizeDeterminant'];
					var fsc = 'greenfile';
					if(fsd=='Mb' && fs >= 100)
						fsc='orangefile';
					if(fsd=='GB')
						fsc='redfile';

					result+='<tr style="max-width: 100%" class="filelist_filename filefont">';
					// show delete link for file.
					if(m_enableDeletionOfFiles>0)
					{
						result+='<td class="BUP_tdminwidth filelist_filename filefont">';
						result+='<a href="javascript:" data-filename="'+fn+'" data-filedir="'+fndir+'" class="deleteFileButton button_initiateDeleteFile_reconfig"><span class="deleteFileButtonContent"></span></a>';
						result+='</td>';
					}
					// show rename link for file.
					if(m_enableRenamingOfFiles>0)
					{
						result+='<td class="BUP_tdminwidth filelist_filename filefont">';
						result+='<a href="javascript:" data-isdir="0" data-filename="'+fn+'" data-filedir="'+fndir+'" class="renameFileButton button_initiateRename_reconfig"><span class="renameFileButtonContent"></span></a>';
						result+='</td>';
					}
	
					// NEW: Load the tags.						    //sample.mp3 sits on your domain
					(function(rDir,fDir,fname){
						console.log("Trying to load tags for "+fn+"..");
						ID3.loadTags(rDir+fDir+fname, function() 
						{
							showTags(rDir+fDir+fname,fname);
						}, {
							tags: ["title","artist","album","picture"]
						});
					})(rootDir,fndir,fn);
					// ENDOF NEW
	
					result+='<td class="BUP_tdminwidth"><span id="fileIcon_'+fn+'"></span>&nbsp;</td>';
					result+='<td class="BUP_tdmaxwidth filelist_filename filefont" valign="top">';
					result+='<a href="'+rootDir+fndir+fn+'" target="_new">';
					result+='<span id="txt_'+fn+'">'+fn+'</span>';
					result+='</a></nobr></td>';
					result+='<td class="BUP_tdminwidth filelist_filename filefont '+fsc+'">'+fs+fsd+'</td>';
					result+='</tr>';
					isNotEmpty++;
				}
				result+='</table>';

				// directory is empty.
				if(isNotEmpty<=0)
					result+='<div class="filefont">[Directory is empty.]</div>';

				fileDisplay.html(result);

				/* reconfigure the buttons. */
				// change a directory (forward)
				$('.button_changeDir_reconfig').click(function()
				{
					var dirname = $(this).data('dirname');
					if(m_actualdir.length>0)
						dirname=m_actualdir+"/"+dirname;
					m_actualdir = dirname;
					getFiles_intern(dirname);
				});
				// change a directory (backward)
				$('.button_goback_reconfig').click(function()
				{
					goBackOneDir_intern();
				});

				// delete a file.
				$('.button_initiateDeleteFile_reconfig').click(function()
				{
					var filename = $(this).data('filename');
					var filedir = $(this).data('filedir');
					initiateDeleteFile(filename, filedir);
				});
				// delete a directory.
				$('.button_initiateDeleteDir_reconfig').click(function()
				{
					var dir = $(this).data('dirname');
					initiateDeleteFile(-1337, dir);
				});

				// rename a file or directory.
				$('.button_initiateRename_reconfig').click(function()
				{
					var filename = $(this).data('filename');
					var filedir = $(this).data('filedir');
					var isdir=$(this).data('isdir');
					initiateRename(isdir, filename, filedir);
				});
				afterProcess();
			}
		});
	}
	
	// show mp3 tags
   /**
     * Generic function to get the tags after they have been loaded.
     */
    function showTags(url, filename) {
      var tags = ID3.getAllTags(url);
      var img="&#128441;";
	  var txt=filename+'<br />';
	  if(tags.album)
		  txt=txt+'<span class="albumName">Album: '+tags.album+'</span>';
	  if(tags.artist)
		  txt=txt+'&nbsp;<span class="artistName">by '+tags.artist+'</span>';
      //document.getElementById('title').textContent = tags.title || "";
      //document.getElementById('artist').textContent = tags.artist || "";
      //document.getElementById('album').textContent = tags.album || "";
      var image = tags.picture;
      if (image) 
	  {
		  if(image.data.length>0)
		  {
			var base64String = "";
			for (var i = 0; i < image.data.length; i++) {
				base64String += String.fromCharCode(image.data[i]);
			}
			var base64 = "data:" + image.format + ";base64," +
                window.btoa(base64String);
		
			img='<img class="coverImage" src="'+base64+'" />';
			//document.getElementById('img_'+filename).setAttribute('src',base64);  
		  }
      }
	  document.getElementById('fileIcon_'+filename).innerHTML=img;
	  document.getElementById('txt_'+filename).innerHTML=txt;
    }	

	// goes back one directory if it is not in the root directory.
	var goBackOneDir_intern = function()
	{
		var arr = m_actualdir.split('/');
		var r = '';
		if(arr.length>1)
			r=arr[0];
		if(arr.length>2)
		{
			for(var i=1;i<arr.length-1;i++)
			{
				r+='/'+arr[i];
			};
		}
		console.log("Go back to /"+r);
		getFiles_intern(r);
	};

	// create the upload button.
	var createUploader = function()
	{
		var txt='';
		/* the upload UI */
		txt+='<div id="'+m_upDivId+'_upload_UI_uploader" class="upload_UI_uploader">';
		txt+='<div id="'+m_upDivId+'_upload_UI" class="upload_UI">';
		txt+='	<form id="'+m_upDivId+'_upload_form" class="upload_form" enctype="multipart/form-data" action="" method="post">';
		txt+='		<input type="hidden" id="max_file_size" name="MAX_FILE_SIZE" value="1000000000" />';
		txt+='		<input type="hidden" id="'+m_upDivId+'_uploader_actualdir" name="uploader_actualdir" value="@not_set" />';
		txt+='		<input type="hidden" name="command" value="upload" />';
		txt+='		<nobr>';
		txt+='			<label id="'+m_upDivId+'_fileSelectorButton" class="fileSelectorButton">';
		txt+='				<input type="file" id="'+m_upDivId+'_uploadFile" name="uploadFile" class="uploadFile" required />';
		txt+='				<span id="'+m_upDivId+'_fileSelectorButtonText" class="fileSelectorButtonText">Bitte Datei wählen..</span>';
		txt+='			</label>';
		txt+='		</nobr>';
		txt+='	</form>';
		txt+='	<div id="'+m_upDivId+'_uploadSubmitButton" class="uploadSubmitButton okButton button_uploadFile_reconfig">UPLOAD</div>'
		txt+='</div>';
		txt+='<div id="'+m_upDivId+'_upload_process" class="upload_process">';
		txt+='	<div id="'+m_upDivId+'_inner_upload_process" class="inner_upload_process"></div>';
		txt+='</div>';
		txt+='</div>';

		/* the rename UI */
		txt+='<div id="'+m_upDivId+'_upload_UI_renamer" class="upload_UI_renamer" style="display:none;">';
			txt+='<table class="fullwidth" border="0">';
				txt+='<tr class="fullwidth"><td style="width: 1%;" valign="top"><nobr>Rename:</nobr></td>';
					txt+='<td class="fullwidth" id="'+m_upDivId+'_oldRenameFilename" valign="top">';
						// here the file name overlap span comes in.
				txt+='</td></tr>';
			txt+='</table>'; //<tr><td colspan="2" class="fullwidth">';
			txt+='<div class="fullwidth centerX">';
				txt+='<input type="text" id="'+m_upDivId+'_newRenameFileName" class="input_newRenameFileName fullwidth"></input><br />';
				txt+='<div class="fullwidth rightalign topmargin">';
					txt+='<a href="javascript:" class="cancelButton button_cancel_reconfig">Cancel</a>';
					txt+='<a href="javascript:" class="okButton button_renameFile_reconfig">Rename</a>';
			txt+='</div></div>';
		txt+='</div>';

		/* the mkdir UI */
		txt+='<div id="'+m_upDivId+'_upload_UI_mkdir" class="upload_UI_mkdir" style="display:none;">';
			txt+='<div class="fullwidth centerX">';
				txt+="MKDIR in actual directory:<br />";
				txt+='<input type="text" id="'+m_upDivId+'_newDirName" class="input_newDirName fullwidth"></input><br />';
				txt+='<div class="fullwidth rightalign topmargin">';
					txt+='<a href="javascript:" class="cancelButton button_cancel_reconfig">Cancel</a>';
					txt+='<a href="javascript:" class="okButton button_newDir_reconfig">Create Dir.</a>';
			txt+='</div></div>';
		txt+='</div>';

		/* the delete UI */
		txt+='<div id="'+m_upDivId+'_upload_UI_deleter" class="upload_UI_deleter" style="display:none;">';
			txt+='<table class="fullwidth" border="0">';
				txt+='<tr class="fullwidth"><td style="width: 1%;" valign="top"><nobr>Delete:</nobr></td>';
				txt+='<td class="fullwidth" id="'+m_upDivId+'_DeleteFilename" valign="top">';
					// here the file name overlap span comes in.
				txt+='</td><td style="width:1%;">?</td></tr>';
			txt+='</table>'; //<tr><td colspan="2" class="fullwidth">';
			txt+='<div class="fullwidth centerX">';
				txt+='<div class="fullwidth rightalign topmargin">';
					txt+='<a href="javascript:" class="cancelButton button_cancel_reconfig">Cancel</a>';
					txt+='<a href="javascript:" class="okButton button_deleteFile_reconfig">Delete</a>';
			txt+='</div></div>';
		txt+='</div>';

		/* the result field. */
		txt+='<div id="'+m_upDivId+'_upload_result" class="upload_result"></div>';

		$('#'+m_upDivId).html(txt);

		$('.button_cancel_reconfig').click(function(){cancel();});
		$('.button_uploadFile_reconfig').click(function(){uploadFile();});
		$('.button_renameFile_reconfig').click(function(){renameFile();});
		$('.button_deleteFile_reconfig').click(function(){deleteFile();});
		$('.button_newDir_reconfig').click(function(){createDir();});

		setUploaderChangeEvent();
	};

	// this function will be called after the upload process has finished.
	var afterProcess=function()
	{
		if(m_afterProcessFunction)
		{
			if(typeof(m_afterProcessFunction)==='function')
			{
				m_afterProcessFunction();
			}
		}
	};

	// show mkdir UI.
	this.showMKDIR = function()
	{
		hideResult();
		$('#'+m_upDivId+'_newDirName').val("");
		showUploadUI('upload_UI_mkdir');
	};

	/* removes the old input and creates a new one. */
	var clearFileInput = function()
	{
		var oldInput = document.getElementById(m_upDivId+"_uploadFile");
		var newInput = document.createElement("input");
		newInput.type = "file";
		newInput.id = oldInput.id;
		newInput.name = oldInput.name;
		newInput.className = oldInput.className;
		newInput.style.cssText = oldInput.style.cssText;
		// copy any other relevant attributes
		oldInput.parentNode.replaceChild(newInput, oldInput);
		$('#'+m_upDivId+'_fileSelectorButtonText').html("Bitte Datei wählen..");

		setUploaderChangeEvent();

		if(m_uploadprogressborder)
			m_uploadprogressborder.hide();
		$('#'+m_upDivId+'_uploadFile').val('');
		$('#'+m_upDivId+'_uploadSubmitButton').hide();
		$('#'+m_upDivId+'_upload_UI').show();
	}

	// add the change event to the upload input.
	var setUploaderChangeEvent = function()
	{
		$('#'+m_upDivId+'_uploadFile').on('change',function()
		{
			var fileValue = 'Nichts ausgewählt.';
			//var found=false;
			if($(this).val() !== "")
			{
				fileValue= $(this).val();
				//found=true;
				$('#'+m_upDivId+'_uploadSubmitButton').show();
				$('#'+m_upDivId+'_upload_result').hide();
			}else{
				$('#'+m_upDivId+'_uploadSubmitButton').hide();
			}

			// get the filename out of the file path.
			var f=fileValue.split('\\');
			fileValue=f[f.length-1];
			f=fileValue.split('/');
			fileValue=f[f.length-1];

			createOverlapSpan(m_upDivId+'_fileSelectorButtonText', ''+fileValue);

			console.log("Upload changed to file: "+fileValue);
			afterProcess();
		});
	}

	// show result and stuff after upload.
	var afterUpload=function()
	{
		clearFileInput();
		getFiles_intern(m_actualdir);
		$('#'+m_upDivId+'_upload_result').show();
	}

	// upload a file to the upload directory.
	var uploadFile= function()
	{
		// set the actual dir in the form.
		var actualDirInput = $('#'+m_upDivId+'_uploader_actualdir');
		actualDirInput.val(m_actualdir);

		// now get the form data.
		var formData = new FormData($('#'+m_upDivId+'_upload_form')[0]);
		var ur=$('#'+m_upDivId+'_upload_result');

		// set up the progress bar.
		m_uploadprogressbar = $('#'+m_upDivId+'_inner_upload_process');
		m_uploadprogressborder = $('#'+m_upDivId+'_upload_process');

		m_uploadprogressbar.width(1);

		$('#'+m_upDivId+'_upload_UI').hide();
		m_uploadprogressborder.show();
		//$('#'+m_upDivId+'_upload_process').show();

		var myXhr;
		$.ajax({
			url: BUP.phpDir+'BUP_interpreter.php',  //Server script to process data
			type: 'POST',
			xhr: function() // Custom XMLHttpRequest
				{
					myXhr = $.ajaxSettings.xhr();
					//myXhr.setRequestHeader('Content-Type', 'text/plain; charset="utf-8"');
					if(myXhr.upload)
					{
						console.log("Uploading file...");
						myXhr.upload.addEventListener('progress', UploadProgressHandlingFunction, false);
					}
					return myXhr;
				},
			//Ajax events
			/*beforeSend: function()
				{
					//jBash.instance.enableMe(false);
				},*/
			success: function(data)
				{
					var result = data.replace("@!err!@","");
					if(result!=data)
					{
						ur.html('Upload failed: '+result);
						console.log('Upload failed: '+result);
					}else{
						ur.html('SUCCESS!<br />'+data);
						console.log('Upload SUCCESS! '+data);
					}
					afterUpload();
				},
			error: function(data)
				{
					ur.html('XHR ERROR: '+myXhr.statusText);
					console.log("XHR ERROR while uploading.");
					console.log(myXhr.statusText);
					console.log(data);
					afterUpload();
				},
			// Form data
			data: formData,
			//Options to tell jQuery not to process data or worry about content-type.
			cache: false,
			contentType: false,
			processData: false
		});
	}

	// show a specific part of the uploader UI.
	var showUploadUI = function(idToShow)
	{
		$('#'+m_upDivId+'_upload_UI_uploader').hide();
		$('#'+m_upDivId+'_upload_UI_renamer').hide();
		$('#'+m_upDivId+'_upload_UI_deleter').hide();
		$('#'+m_upDivId+'_upload_UI_mkdir').hide();
		$('#'+m_upDivId+'_'+idToShow).show();
	}

	/* show the delete file UI. */
	var m_dirForAction = '';
	var m_isActionForDir = false; // is the action meant for a directory or a file (false)? 
	var initiateDeleteFile = function(fileName, fileDir)
	{
		m_dirForAction = fileDir;
		m_isActionForDir = false;
		if(fileName===-1337)
		{
			fileName = fileDir;
			m_isActionForDir = true;
		}

		m_dirForAction = fileDir;
		hideResult();
		// we need to focus on the uploader, so we take the input field from the renamer for it.
		var fin = $('#'+m_upDivId+'_newRenameFileName');
		showUploadUI('upload_UI_renamer');
		fin.focus();

		// then we switch to the other dialog.
		hideResult();
		showUploadUI('upload_UI_deleter');

		// make an animation if the file name is longer than the field.
		createOverlapSpan(m_upDivId+'_DeleteFilename', fileName);

		$('#'+m_upDivId+'_deleteCancelButton').focus();

		// maybe adjust height or something.
		afterProcess();
	}
	
	/* delete a file. */
	var deleteFile = function()
	{
		var command = "rmfile";
		//var phpFile = 'BUP_interpreter.php';

		var fileName = $('#'+m_upDivId+'_DeleteFilename_OverlapSpanRealContent').html();
		if(m_dirForAction.length>0)
			fileName=m_dirForAction+fileName;

		// check if it should delete a directory.
		if(m_isActionForDir)
		{
			console.log("Deleting dir "+m_dirForAction);
			fileName=m_dirForAction;
			//phpFile='BUP_ajax_deleteDir.php';
			command = "rmdir";
		}else{
			console.log("Deleting file "+fileName);
		}
		hideResult();
		clearFileInput();
		showUploadUI('upload_UI_uploader');

		// call the file deleter.
		$.ajax({
			url: BUP.phpDir+'BUP_interpreter.php',
			method: 'POST',
			dataType: 'text',
			data: {command: command, itemToDelete: fileName},
			success: function(data)
			{
				console.log('Result: '+data);
				getFiles_intern(m_actualdir);
				showResult(data);
			}
		});
	}

	/* show the rename dialog. */
	var initiateRename = function(isdir, oldFileName, fileDir)
	{
		m_dirForAction = fileDir;
		var fin = $('#'+m_upDivId+'_newRenameFileName');
		hideResult();

		fin.val(oldFileName);
		showUploadUI('upload_UI_renamer');
		fin.focus();

		// make an animation if the file name is longer than the field.	
		createOverlapSpan(m_upDivId+'_oldRenameFilename', oldFileName);

		// maybe adjust height or something.
		afterProcess();
	}

	
	/* sends an ajax request to rename a file. */
	var renameFile = function()
	{
		var fin = $('#'+m_upDivId+'_newRenameFileName');
		var fold =$('#'+m_upDivId+'_oldRenameFilename_OverlapSpanRealContent');

		var newFileName = fin.val();
		var oldFileName=fold.html();

		if(m_dirForAction.length>0)
		{
			newFileName=m_dirForAction+newFileName;
			oldFileName=m_dirForAction+oldFileName;
		}

		if(newFileName==oldFileName)
		{
			showResult('Rename failed:<br />Filename did not change.');
		}else{
			console.log("Renaming file "+oldFileName+" to "+newFileName);
			hideResult();
			showUploadUI('upload_UI_uploader');
			// call the file renamer.
			$.ajax({
				url: BUP.phpDir+'BUP_interpreter.php',
				method: 'POST',
				dataType: 'text',
				data: {command: 'rename', fileToRename: oldFileName, newRenamedFileName: newFileName},
				success: function(data)
				{
					console.log('Result: '+data);
					getFiles_intern(m_actualdir);
					clearFileInput();
					showUploadUI('upload_UI_uploader');
					showResult(data);
				}
			});
		}
	}
	
	// create a new directory.
	var createDir = function()
	{
		var dirin = $('#'+m_upDivId+'_newDirName');
		var newDirName = dirin.val();

		if(newDirName.length<=0)
		{
			alert("You need to input a directory name.");
			return;
		}
		
		if(m_actualdir.length>0)
			newDirName=m_actualdir+"/"+newDirName;
		
		console.log("Creating directory "+newDirName);
		hideResult();
		showUploadUI('upload_UI_uploader');
		// call the dir creator.
		$.ajax({
			url: BUP.phpDir+'BUP_interpreter.php',
			method: 'POST',
			dataType: 'text',
			data: {command: 'mkdir', dirToCreate: newDirName},
			success: function(data)
			{
				console.log('Result: '+data);
				getFiles_intern(m_actualdir);
				clearFileInput();
				showUploadUI('upload_UI_uploader');
				showResult(data);
			}
		});
	}

	/* cancel button pressed on the rename UI. */
	var cancel = function()
	{
		hideResult();
		showUploadUI('upload_UI_uploader');
		clearFileInput();
		afterProcess();
	}

	/* shows a result. */
	var showResult = function(result)
	{
		var res = $('#'+m_upDivId+'_upload_result');
		res.html(result);
		res.show();
		afterProcess();
	}

	/* hides the result. */
	var hideResult= function()
	{
		$('#'+m_upDivId+'_upload_result').hide();
		afterProcess();
	}

	UploadProgressHandlingFunction = function(e)
	{
		if(!e.lengthComputable || !m_uploadprogressbar || !m_uploadprogressborder)
			return;

		var percent = 0.0+((m_uploadprogressborder.width() / e.total)*e.loaded);
		m_uploadprogressbar.width(percent);
	};

	createUploader();
};
BUP.phpDir = g_phpDir;

/* the dir where your ajax files are, seen from the main page. */
// does not work as wanted.
/*
loadJSONFile(BUPConfigDirectory, function(data)
{
	BUP.phpDir = getJSONValue(data, "PHP_PATH_FROM_HTMLDIR");
	console.log("Config loaded."+BUP.phpDir);
});
*/
console.log("BUP JS loaded.");
