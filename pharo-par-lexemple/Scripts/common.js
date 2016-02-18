// funnyordie.com
var WSCommonAnalyster = {};

(function() {
	var videoURL;
	var downloadBtnDiv;

// é’ˆ å¯¹ Vimeo ç½‘ ç«™
	function htmlFive(element) {
		var videoURL = document.location.href;
		var url = videoURL;
		if(url.indexOf("vimeo.com") != -1 && isHTML5 == true)
		{
			vplayerDiv = element.parentNode.parentNode.parentNode;
			var encodeData = "pageUrl=" + videoURL + "-WS-GUES-cookies=" + document.cookie;
			vbtnDownload = WSCore.attachButtonDiv(vplayerDiv, WSExtensionConfig.getDownloadButtonPosition(), "", WSExtensionConfig.getInvokeProtocol() + WSCore.base64Encode(encodeData));
			WSCore.bind_mouseover(vplayerDiv, vbtnDownload);
		}	      
    }

// é’ˆ å¯¹ lynda ç½‘ ç«™
    function islynda(event)
    {
        var videoURL = document.location.href;
        if (videoURL.indexOf("lynda.com") == -1) return false;
	    if (WSCore.getBrowserIndent() != "firefox") 
	        return (event.target instanceof HTMLDivElement) && (event.target.getAttribute("class").indexOf("ToggleOverlay") != -1);
		else
		    return (event.originalTarget.toString().indexOf("HTMLDivElement") != -1) && (event.target.getAttribute("class").indexOf("ToggleOverlay") != -1);
    }

	function handleMouseoverEvent(event) {
		var validTarget = false ;
		if (WSCore.getBrowserIndent() != "firefox") {	//Chrome & Safari
			validTarget = event.target instanceof HTMLEmbedElement || event.target instanceof HTMLObjectElement || event.target instanceof HTMLIFrameElement || event.target instanceof HTMLVideoElement || islynda(event);
		}
		else {
			// try {
			// 	validTarget = event.originalTarget instanceof HTMLEmbedElement || event.originalTarget instanceof HTMLObjectElement || event.originalTarget instanceof HTMLIFrameElement || event.originalTarget instanceof HTMLVideoElement ;
			// }
			// catch(ex) {
				validTarget = (event.originalTarget.toString().indexOf("HTMLEmbedElement") != -1) || (event.originalTarget.toString().indexOf("HTMLObjectElement") != -1) || (event.originalTarget.toString().indexOf("HTMLIFrameElement") != -1) || (event.originalTarget.toString().indexOf("HTMLVideoElement") != -1) || islynda(event);
			//}
		}
			
		if (validTarget) {
       		// 233/1397 çš„ æ¯” ä¾‹ æ˜¯ ä¸º äº† è¿‡ æ»¤ æŽ‰ veoh ç½‘ ç«™ çš„ ä¸€ ä¸ª é«˜ å®½ æ¯” ä¸º233/1397 çš„ flash
			var flash = WSCore.targetObject(event);
			videoURL = document.location.href;
			var condition = false;
			if (videoURL.indexOf("facebook.com") != -1)
				condition = flash.offsetHeight > 180 && flash.offsetWidth > 160 && (flash.offsetHeight / flash.offsetWidth > 255 / 960);
			else 
				condition = flash.offsetHeight > 180 && flash.offsetWidth > 160 && (flash.offsetHeight / flash.offsetWidth > 255 / 960 && flash.offsetHeight / flash.offsetWidth < 1.2)
            if (condition)
			{
            	if (downloadBtnDiv) {
					WSCore.unbind_mouseover(playerDiv111, downloadBtnDiv);
                	WSCore.deleteAttachedButton(downloadBtnDiv);
					playerDiv111 = null;
					downloadBtnDiv = null;
				}

				var invokeURL = "pageUrl=" + videoURL ;
				//if(videoURL.indexOf("nicovideo.jp") != -1)
				{
					invokeURL += "-WS-GUES-";
					invokeURL += "cookies=" + document.cookie ;
				}
				//console.log(invokeURL);
				downloadBtnDiv = WSCore.attachButtonDiv(WSCore.targetObject(event), WSExtensionConfig.getDownloadButtonPosition(), "", WSExtensionConfig.getInvokeProtocol() + WSCore.base64Encode(invokeURL));
				playerDiv111 = WSCore.targetObject(event).parentNode;
				if (WSCore.getBrowserIndent() != "firefox") {
					if (playerDiv111 instanceof HTMLObjectElement || playerDiv111 instanceof HTMLEmbedElement) {
						playerDiv111 = playerDiv111.parentNode;
					}
				}else{
					if ((playerDiv111.toString().indexOf("HTMLObjectElement")!= -1) || (playerDiv111.toString().indexOf("HTMLEmbedElement") != -1)) {
						playerDiv111 = playerDiv111.parentNode;
					}
				}
				WSCore.bind_mouseover(playerDiv111, downloadBtnDiv);
				WSCore.showElement(downloadBtnDiv);
			}
		}
    }
    
    function handleBeforeLoadEvent(event)
    {
	    element = WSCore.targetObject(event);
		try {
			if (isHTML5 == false)
				isHTML5 = (element.toString().indexOf("HTMLVideoElement")!= -1) ;
		}
		catch(ex) {
		}
	    htmlFive(element);
    }

    var url = document.location.href;
    var isHTML5 = false;
	
    if(url.indexOf("vimeo.com") != -1)
    {
        document.addEventListener("beforeload", handleBeforeLoadEvent, true); 
        document.addEventListener("mouseover", handleMouseoverEvent, false);
    }
    else
    {
        document.addEventListener("mouseover", handleMouseoverEvent, false);
    }

})();