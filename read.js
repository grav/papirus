//

if(typeof(readability) === "undefined"){
    readability = {};
}

(function (readability) {

	readability.baseUrl = 'https://www.readability.com';
	readability.type = 'read';
    readability.frameId = 'readabilityIFrame-'+Math.random();
	readability.frameUrl = readability.baseUrl + '/articles/queue';
	readability.frameContainerId = 'readabilityFrameContainer-' + readability.type;
	readability.frameContainer = null;
	readability.docCompressed = null;

	readability.extensionInfo = {
		"type":    (typeof window.readabilityExtensionType == "undefined" || window.readabilityExtensionType == "" ? 'bookmarklet' : window.readabilityExtensionType ),
		"version": (typeof window.readabilityExtensionVersion == "undefined" || window.readabilityExtensionVersion == "" ? "1" : window.readabilityExtensionVersion )
	}

	
	readability.frameContainerStyles = {
		position: 'fixed',
		display: 'block',
		top: '0px',
		left: '0px',
		width: '100%',
  		height: '100%',
  		padding: '0',
  		margin: '0',
		backgroundColor: "transparent",
  		zIndex: '2147483647'
	}; 
  

	
readability.frameStyles = ["width: 100%", "height: 100%", "display: block", "overflow: auto", // Proper iframe overflow in FF. Webkit uses the document body's CSS setting.
"margin: 0", "padding: 0", "border-width: 0"].join(';'); 


	/* A method so that if we change frameId we still get valid HTML */
	
// Adds onload, which will allow us to hide the content behind the frame after we have the new content.
readability.getFrameHtml = function () {
	return ['<iframe id="' + readability.frameId + '"', 'name="' + readability.frameId + '"', 'scrolling="auto"', 'frameborder="0"', 'style="' + readability.frameStyles + '"', 'onload="readability.frameLoaded(this)">', '</iframe>'].join(' ');
}; 


	readability.debug = function (s) {
		if (typeof console !== "undefined") {
			return console.log(s);
		}
	};

	readability.getExtensionDetails = function () {
		if (typeof window.readabilityExtensionDetails !== null) {
			return window.readabilityExtensionDetails;
		} else {
			return "bookmarklet";
		}
	};

	readability.compress = function (doc_node) {
		var i, il, html, preTags = doc_node.getElementsByTagName('pre');

		for (i = 0, il = preTags.length; i < il; i++) {
			preTags[i].innerHTML = preTags[i].innerHTML.replace(/ /g, '&nbsp;').replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '--rdb-newline--');
		}
		html = "<html>" + doc_node.innerHTML + "</html>";
		html = html.replace(/[\s\t\r\n]+/g, ' ');
		html = html.replace(/<!--.*?-->/g, '');
		html = html.replace(/--rdb-newline--/g, "\n");

		return html;
	};

	readability.hidePageElements = function () {
		var child, i;
		for (i = 0; i < document.body.childNodes.length; i++) {
			child = document.body.childNodes[i];

			if (child.nodeType !== 1) {
				continue;
			}

			display = child.currentStyle ? child.currentStyle.display : document.defaultView.getComputedStyle(child, null).getPropertyValue('display');

			if (child.id !== readability.frameContainerId) {
				child.origDisplay = display;
				child.style.display = 'none';
			}
		}
	};

	readability.removeDocumentScrolling = function () {
		var child, display, i;                       
		document.body.style.overflow = "hidden";
	};

	readability.addDocumentScrolling = function () {
		var child, i;

		for (i = 0; i < document.body.childNodes.length; i++) {
			child = document.body.childNodes[i];

			if (child.nodeType !== 1) {
				continue;
			}

			if (child.origDisplay) {
				child.style.display = child.origDisplay;
			}
		}

		document.body.style.overflow = "auto";
	};

	readability.isLocalPage = function () {
		if (document.location.href.indexOf(readability.baseUrl) !== - 1) {
			return true;
		}
		else {
			return false;
		}
	};
	/* Cross-browser dispatchEvent - from http://www.cross-browser.com/forums/viewtopic.php?id=384 */
	readability.dispatchEvent = function (element, rawEvent) {
		// Attempts to fire a raw DOM event on an element
		// param name="element" type="Element" The element or its identifier to fire the event
		// param name="rawEvent" type="Object" The raw DOM event object to fire
		// returns type="Boolean" True if the event was successfully fired, otherwise false
		try {
			if (element.fireEvent) {
				element.fireEvent("on" + rawEvent.type, rawEvent);
				return true;
			}
			else if (element.dispatchEvent) {
				element.dispatchEvent(rawEvent);
				return true;
			}
		} catch (e) {
			readability.debug('Error caught:');
			readability.debug(e);
		}

		return false;
	};

	readability.checkDocLocation = function () {
		if (document.location.href.indexOf(readability.baseUrl) !== - 1) {
			if (document.getElementById('read-bar') !== null && document.getElementById('read-link') !== null) {
				var clickEvent = document.createEvent('MouseEvent');
				clickEvent.initMouseEvent('click', true, true, document.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);

				readability.dispatchEvent(document.getElementById('read-link'), clickEvent);
				return false;
			} else {
				document.location = readability.baseUrl;
				return false;
			}
		}
	};

	// Cross browser addEventListener from http://snipplr.com/view.php?codeview&id=3116
	readability.listen = function (evnt, elem, func) {
		if (elem.addEventListener) { // W3C DOM
			return elem.addEventListener(evnt, func, false);
		} else if (elem.attachEvent) { // IE DOM
			var r = elem.attachEvent("on" + evnt, func);
			return r;
		} else {
			return false;
		}
	};

	// Receive cross-DOM js events
	readability.receiveMessage = function (event) {
		if (event.origin === readability.baseUrl && event.data) {

			/**
			 * Special handling for set_token, otherwise just event handlers.
			 * TODO: Turn these all into json structures with a name rather than just strings.
			**/
			if (event.data.indexOf('set_token') === 0) {
				window.readabilityToken = event.data.replace('set_token=', '');
				readability.readabilityToken = window.readabilityToken;
			} else {
				try {
					var event_method = event.data.replace('-', '_');
					if (typeof readability.event_handlers[event_method] !== "undefined") {
						readability.event_handlers[event_method](event);					    
					}
				} catch (e) {
					readability.debug('Error caught in receiveMessage:');
					readability.debug(e);
				}
			}
		}
	};

	// The handlers for cross-DOM events
	
  readability.event_handlers = {
    rdb_load_modal: function (event) {
      var iframeContainer = readability.frameContainer,
      styleKey,
      iframeContainerStyles = {position: 'fixed', display: 'block', width: '100%', height: '100%', zIndex: '2147483647',background: "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAA9JREFUeNpiYmBgWAYQYAAAtQCpptGMZwAAAABJRU5ErkJggg==')"};

			for (styleKey in iframeContainerStyles) {
			  if (iframeContainerStyles.hasOwnProperty(styleKey)) {
          iframeContainer.style[styleKey] = iframeContainerStyles[styleKey];
        }
      }
		},

		rdb_remove_frame: function (event) {
			var frameContainer = readability.frameContainer;
			if (frameContainer) {
				frameContainer.parentNode.removeChild(frameContainer);
			}
		},

		rdb_load_bar: function (event) {
			var messageBar = {
				styles: {
					position: 'fixed',
					display: 'block',
					top: '0px',
					left: '0px',
					width: '100%',
					padding: '0',
					margin: '0',
					height: '43px',
					background: 'black'
				}
			};
			readability.addStyle(readability.frameContainer, messageBar.styles);
		},

		rdb_load_new_frame: function (event, obj) {
			readability.closeFrame();
			readability.frameContainer = null;
			readability.frameId = 'readabilityIFrame-' + Math.random();
			readability.init(true); // Force a reinit
		},

		rdb_close: function (event) {
			readability.closeFrame();
		},

		rdb_repost_form: function (event) {
			readability.openFrame();
		}
	}; 

    /**
     * Removes script tags from the document.
     *
     * @param Element
    **/
    readability.removeScripts = function (doc) {
        var scripts = doc.getElementsByTagName('script');
        for(var i = scripts.length-1; i >= 0; i--)
        {
            if(typeof(scripts[i].src) == "undefined" || (scripts[i].src.indexOf(readability.baseUrl) == -1 && scripts[i].src.indexOf('typekit') == -1))
            {
                scripts[i].nodeValue="";
                scripts[i].removeAttribute('src');
		        if (scripts[i].parentNode) {
	                scripts[i].parentNode.removeChild(scripts[i]);          
		        }
            }
        }
    };

	readability.hideFlash = function () {
		var i, il, embeds = document.getElementsByTagName('embed'),
		objects = document.getElementsByTagName('object'),
		iframes = document.getElementsByTagName('iframe');

		for (i = 0, il = embeds.length; i < il; i++) {
			embeds[i].style.display = 'none';
		}

		for (i = 0, il = objects.length; i < il; i++) {
			objects[i].style.display = 'none';
		}

		for (i = 0, il = iframes.length; i < il; i++) {
			if (iframes[i].id !== readability.frameId) {
				iframes[i].style.display = 'none';
			}
		}

	};

	readability.addStyle = function (elem, styles) {
		var styleKey;

		for (styleKey in styles) {
			if (styles.hasOwnProperty(styleKey)) {
				elem.style[styleKey] = styles[styleKey];
			}
		}
	};

	readability.getFrameContainer = function () {
		if (readability.frameContainer === null) {
			readability.frameContainer = document.createElement('div');
			readability.frameContainer.id = readability.frameContainerId;
			readability.frameContainer.innerHTML = readability.getFrameHtml();
			readability.addStyle(readability.frameContainer, readability.frameContainerStyles);
		}

		return readability.frameContainer;
	};

	readability.openFrame = function () {
		var r = readability,
		// shortcut
		frameContent;

    //Readability cannot parse framesets, so quit it.
    if(document.body.nodeName == 'FRAMESET') {
      alert("To read the content of a frame with Readability, right click on that content and select 'open this frame in new tab' and run Readability on the new tab.");
      return;
    }

		readability.docCompressed = false;

		if (readability.frameContainer === null) {
			document.body.appendChild(r.getFrameContainer());
		}
		r.listen("message", window, r.receiveMessage);

		
		r.hideFlash();
		r.removeDocumentScrolling();
    

		try {
			readability.docCompressed = readability.compress(document.documentElement);
		} catch (e) {}
		
    	var load_text = (readability.type === 'read') ? '<div id="read-load">Converting...</div>' : '<div id="save-load">Saving...</div>';
        var charset = (document.characterSet ? document.characterSet : document.charset);

		var hiddenInputs = {
			"token":             r.readabilityToken,
			"extensionType":     r.extensionInfo['type'],
			"extensionVersion":  r.extensionInfo['version'],
			"legacyBookmarklet": (typeof window.readStyle !== "undefined" ? 1 : 0),
			"read":              (readability.type=='read' ? 1 : 0),
			"archive":           (readability.type=='support' ? 1 : 0),
			"support":           (readability.type=='support' ? 1 : 0),
			"url":               window.location.href,
			"doc":               readability.docCompressed,
			"charset":           charset
		};

        /**
         * Note: accept-charset is needed to be forced to the current character set because otherwise it appears Firefox will try to convert the data before the server gets a chance to work with it.
         *       By specifying the same character set no transforms are attempted on the client side, so we can handle it properly on the server side.
         *       Without accept-charset you will get bad characters on URLs like http://www.deseretnews.com/article/705369257/Parents-confused-upset-over-new-car-seat-guidelines.html
        **/
        frameContent = [
            '<html>',
				'<head>',
					'<style type="text/css">',
					
					'body { background-color: transparent; }',
					'#wrapper { text-align: center; position:absolute;top:6em;left:50%;margin-left:-92.5px;}',
                    '#read-load, #save-load {text-align : center;color : #ffffff;padding-top: 10px; font:bold 1.2em Georgia; margin-left: 0.5em;}',
                    '#save-load.saved {padding-top: 4px;}',
					'#spinner-box {	background-color:#232323;height:107px;width:189px;margin:20px auto;padding:22px 0 0;-moz-border-radius:10px;-webkit-border-radius:10px;border-radius:10px;text-align: center;border-width:1px 0 0 1px;border-style:solid; border-color:#000;opacity: .85;-moz-opacity:.85;filter: alpha(opacity=85);}',
					'</style>',
				'</head>',
				'<body>',
					'<div id="wrapper">',
	            		'<div id="spinner-box">',
	            			'<img src="data:image/gif;base64,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" />',
							load_text,
						'</div>',
			            '<form id="readabilityPostForm" accept-charset="', charset, '" enctype="application/x-www-form-urlencoded" style="display: none;" method="post" action="', r.frameUrl, '"></form>',
					'</div>',
				'</body>',
			'</html>'
        ].join('');

        // Todo fix bug that occurs here: http://www.reddit.com/r/blog/comments/ddc0w/update_on_the_colbert_rally_time_to_show_our/
        var leframe = document.getElementById(r.frameId);
        var ledocument = null;
        if( leframe.contentDocument ) {
            ledocument = leframe.contentDocument;
        } else if ( leframe.contentWindow ) {  //IE
            ledocument = leframe.contentWindow.document;
        }

        ledocument.write(frameContent);

		var postForm = ledocument.getElementById('readabilityPostForm');
		for (var inputKey in hiddenInputs) {
			if(hiddenInputs.hasOwnProperty(inputKey)) {
				var newInput   = ledocument.createElement('input');
				newInput.type  = "hidden";
				newInput.name  = inputKey;
				newInput.id    = inputKey;
				newInput.value = hiddenInputs[inputKey];
				postForm.appendChild(newInput);
			}
		}

		ledocument.write(['<scr', 'ipt type="text/javascript">window.setTimeout(function() { document.getElementById("readabilityPostForm").submit(); }, 1);</scr', 'ipt>'].join(''));

	};
	
readability.frameLoaded = function (frame) {
	try {
		// Just try to access a restricted part of the document. If we can access it, that means we're not on the loaded doc yet.
		x = window[readability.frameId].document;
	} catch (e) {
		// If we got caught, that means we've loaded the frame. Hide the backgrund elements.
		readability.hidePageElements();
	}
}; 


    readability.url_is_valid = (function(){
        var invalid_list = [
                /file:/,
                /about:blank/
            ];
        return function(given_url){
            var url = given_url ? given_url.toLowerCase() : document.location.href.toLowerCase(),
                i;
            for(i = 0; i < invalid_list.length; i++){
                if(url.search(invalid_list[i]) !== -1){
                    return false;
                }
            }
            return true;
        }
    }());

    readability.site_in_blacklist = (function (){
        // We can't assume we will have map() here, so lowercase this badboy
        var site_blacklist = 'www.youtube.com;mail.google.com'.split(';');
        site_blacklist = (function(){
            var return_array = [],
                i;
            for(i = 0; i < site_blacklist.length; i++){
                return_array.push(site_blacklist[i].toLowerCase());
            }
            return return_array;
        }());

        return function(given_url){
            var url = given_url ? given_url.toLowerCase() : document.location.href.toLowerCase(),
                netloc;

            netloc = url.indexOf('http') >= 0 ? url.split('/')[2] : url.split('/')[0];
            return site_blacklist.indexOf(netloc) >= 0;
        };
    }());

	readability.closeFrame = function() {
		var frameContainer = readability.frameContainer;
		if (frameContainer) {
			frameContainer.style.display = 'none';
		}
		readability.addDocumentScrolling();
	};

	
	readability.init = function(force) {
		
if (!force && document.getElementById(readability.frameContainerId) !== null) {
	readability.frameContainer = document.getElementById(readability.frameContainerId);
	readability.frameContainer.style.display = 'block';
	readability.removeDocumentScrolling();
	return false;
}

/* If we're already on a parsed page */
if (readability.isLocalPage() && document.getElementById('rdb-article') !== null ) {
	return;
}



        readability.removeScripts(document);

		// If we are on our own page, bounce it to the homepage
		if (readability.checkDocLocation()) {
			readability.listen("message", window, readability.receiveMessage);
			readability.openFrame();
		}
		readability.readabilityToken = window.readabilityToken;
		readability.openFrame();
	};

} (readability));


// First, check to see if we should even run Readability on this page
if(
    readability.url_is_valid() &&
    !readability.isLocalPage() && // Make sure we aren't trying to run readability on itself
    !readability.site_in_blacklist() // Don't run readability on blacklisted sites
  ){
    if(navigator.userAgent.indexOf('MSIE') !=-1) {

        var queryParams = 'url=' + encodeURIComponent(window.top.location) + '&token=' + (typeof(window.readabilityToken) !== "undefined" ? encodeURIComponent(window.readabilityToken) : "");

        if(readability.type == "read") {
            window.top.location = readability.baseUrl + '/pr?' + queryParams;
        } else {
            document.scrollTop = 0;
            var wrap = document.createElement('div');
            wrap.innerHTML = '<iframe src="https://www.readability.com/prl?' + queryParams + '" width="500" height="200" frameBorder="0" allowTransparency="true" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 281823498"></iframe>';
            document.body.appendChild(wrap);
            readability.listen("message", window, function() {
                if (event.origin === readability.baseUrl && event.data) {
                    if (event.data.indexOf('set_token') === 0) {
                        window.readabilityToken = event.data.replace('set_token=', '');
                        readability.readabilityToken = window.readabilityToken;
                    } else if (event.data == "close_frame"){
                        wrap.parentNode.removeChild(wrap);
                    }
                }
            });
        }
        
    } else {
        readability.init();    
    }
}
