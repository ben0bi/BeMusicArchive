// make a value between 0 and 255 to hex 00 to FF
function toHexByte(value)
{
	// boundaries between 0 and 255
	var v = value;
	if(value>=256)
		v = value % 256;
	
	v = v.toString(16);
	if(v.length<=1)
		v='0'+v;
	return v;
}

// Get the value of a GET parameter from an url.
// returns 1 if the name exists, returns null if nothing exists 
// and returns the value if a value for the name exists.
function uGET( name, url ) 
{
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
	
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
	if(results==null)
	{
		// check if the name exists (without value).
		var regExists = "[\\?&]"+name;
		var r = new RegExp(regExists)
		if(r.test(url))
			return 1;
		else
			return null;
	}else{
		if(results[1]==null || results[1]=='')
			return 1;
	}
	return results[1];
}

// load a configuration file and pass the config to your desired function.
function loadJSONFile(filename, successFunction)
{
	$.getJSON(filename, function(data)
	{
		console.log("JSON File "+filename+" loaded.");
		if(typeof(successFunction==="function"))
			successFunction(data);
		else
			successFunction = data;
	}).fail(function(e)
	{
		console.log("Failed to load JSON file "+filename+".");
	});
}

// get a specific json value from the data retrieved with the above function.
function getJSONValue(data, keyToSearch)
{
	var result = null;
	$.each( data, function( key, val ) 
	{
		console.log("Check key: "+key+" with value "+val+" for "+keyToSearch);
		if(key.toString() == keyToSearch.toString())
		{
			result = val;
			console.log("FOUND!");
		}
	});
	if(result==null)
		console.log("No value found for ["+keyToSearch+"].");
	return result;
}

/* create a text entry which moves when it is broader than its container. */
/* get your content back with $('#'+containerID+'_OverlapSpanRealContent').html() */
var createOverlapSpan= function(containerID, content, onlyOnMouseOver)
{
	var container = $('#'+containerID);
	
	var isAnimating = 0;
	// maybe get old animating.
	var oldAnim = $('#'+containerID+'_OverlapSpanIsAnimating');
	if(oldAnim.length>0)
		isAnimating=parseInt(oldAnim.val());
	
	//console.log("Anim: "+isAnimating);
	
	var txt='';
	txt+='<input type="hidden" id="'+containerID+'_OverlapSpanIsAnimating" value="0" />';
	txt+='<input type="hidden" id="'+containerID+'_OverlapSpanFreezeAnimation" value="0" />';
	txt+='<input type="hidden" id="'+containerID+'_OverlapSpanX" value="0" />';
	txt+='<div style="display:none;" id="'+containerID+'_OverlapSpanRealContent">'+content+'</div>';
	txt+='<div id="'+containerID+'_OverlapSpan" class="fullwidth overlapSpan">';
		txt+='<nobr><span id="'+containerID+'_OverlapSpanContent" class="overlapSpanContent">'+content+'</span></nobr>';
	txt+='</div>';
	
	// fill the container.
	var l1=1;
	var l2=0;
	if(container)
	{
		// set the overlap span content.
		container.html(txt);

		// maybe reset the text and do not create the spans to inherit the css of the parent container. 
		// (like text-align: center and such.)
		
		// check if the size is bigger, else fill the container directly with the content.
		l1 = parseInt($('#'+containerID+'_OverlapSpan').width());
		l2 = parseInt($('#'+containerID+'_OverlapSpanContent').width());
		//console.log("Outer: "+l1+" Inner: "+l2);
		if(l2<=l1)
		{
			txt=content;
			txt+='<div style="display:none;" id="'+containerID+'_OverlapSpanRealContent">'+content+'</div>';
			container.html(txt);
		}
	}
	
	// only animate on mouseover.
	if(onlyOnMouseOver)
	{
		if(onlyOnMouseOver>=1)
		{
			$('#'+containerID).on('mouseover', function() {unfreezeOverlapSpan(containerID);});
			$('#'+containerID).on('mouseout', function() {freezeOverlapSpan(containerID);});
			freezeOverlapSpan(containerID);
		}
	}
	
	// only animate if it is not animating right now and if the text is broader.
	if(isAnimating==0 && l2>l1)
		_animateOverlapSpan(containerID);
}

// stop it beeing animated.
function freezeOverlapSpan(containerID)
{
	var freeze = $('#'+containerID+'_OverlapSpanFreezeAnimation');
	freeze.val(1);
}

// reanimate it.
function unfreezeOverlapSpan(containerID)
{
	var freeze = $('#'+containerID+'_OverlapSpanFreezeAnimation');
	var frozen = 0;
	if(freeze.length>0)
		frozen = freeze.val();
	
	// do nothing if not frozen.
	if(frozen<=0)
		return;

	// just reanimate this overlap span with its content.	
	// reset freeze value.
	freeze.val(0);
	var animating = $('#'+containerID+'_OverlapSpanIsAnimating');
	if(animating)
	{
		// only animate if not already animating.
		if(animating.val()<=0)
			_animateOverlapSpan(containerID);
	}		
}

/* let the content float from left to right and vice versa. */
_animateOverlapSpan = function(containerID)
{
	var souter=$('#'+containerID+'_OverlapSpan');
	var scontent =$('#'+containerID+'_OverlapSpanContent');
	var sx = $('#'+containerID+'_OverlapSpanX');
	var freeze = $('#'+containerID+'_OverlapSpanFreezeAnimation');
	
	var isFrozen = 0;
	if(freeze.length>0)
		isFrozen = freeze.val();
	
	var tmpX = 0;
	if(sx.length>0)
		tmpX = sx.val();
	
	// if there is no content, there is nothing to animate.
	if(scontent.length<=0 || souter.length<=0)
		return;
	
	// only animate if broader than container.
	if(scontent.width() > souter.width())
	{
		if(isFrozen <= 0)
		{
			var l=parseInt(tmpX);
			var dist=souter.width()-scontent.width()-20;
			l-=1;
			if(l<=dist)
				l=-l;
	
			scontent.css('left', 10-Math.abs(l));
			sx.val(l);
		
			// set animation flag. If not, speed doubles with each change.
			$('#'+containerID+'_OverlapSpanIsAnimating').val(1);
			setTimeout(function() 
			{
				// and animate it.
				_animateOverlapSpan(containerID);
			}, 30);
		}else{
			// frozen animation: reset left.
			scontent.css('left', 0);
			sx.val(0);
			// remove animation flag.
			$('#'+containerID+'_OverlapSpanIsAnimating').val(0);
		}
	}else{
		// remove animation flag.
		$('#'+containerID+'_OverlapSpanIsAnimating').val(0);
	}
}