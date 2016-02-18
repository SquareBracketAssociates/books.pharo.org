var AttachStyleEnum = {
	AttachOuterTopLeft: 0, 
	AttachOuterTopRight: 1, 
	AttachOuterBottomLeft: 2, 
	AttachOuterBottomRight: 3, 
	AttachInnerTopLeft: 4, 
	AttachInnerTopRight: 5, 
	AttachInnerBottomLeft: 6, 
	AttachInnerBottomRight: 7
}

var AttchStyleForPlayList = {
	AttachOuterCenterLeft: 0,
	AttachOuterCenterRightAtTop: 1,
	AttachOuterCenterRightAtMiddle: 2
} 

// è¿™ é‡Œ åŠ  ä¸Š äº† å‘½ å ç©º é—´ ï¼Œè°ƒ ç”¨  å‡½ æ•° ä¸­ çš„ å˜ é‡ ç›´ æŽ¥ ä½¿ ç”¨ WSCore. è¿™ ç§ æ–¹ å¼ æ¥ è¯» å– çš„ ï¼Œ å…¶ ä½™ ä½¿ ç”¨ this. è¯» å– ã€‚
var WSCore = {
	// variants
	attachButtonList: [], 
	isInitialAdjustPos: false, 
	
	timeout: 500, 
	closetimer: 0, 
	ddmenuitem: 0, 
	
	timeoutHandle: null, 
	
	onShowElement: null, 
	onDelayHideElement: null, 
	
	// functions
	
	//	Create an New GUID
	newGuid: function() {
		var guid = "";
		for (var i = 1; i < 32; i++) {
			var n = Math.floor(Math.random() * 16.0).toString(16);
			guid += n;
			if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) guid += "-";
		}
		return guid;
	}, 

	//	Get Previous Sibling Element
	getPreviousSibling: function(n) {
		var x = n.previousSibling;
		while (x.nodeType != 1) {
			x = x.previousSibling;
		}
		return x;
	}, 
	
	// Get Element Position
	getElementPos: function(el) {
		var ua = window.navigator.userAgent.toLowerCase();
		var isOpera = (ua.indexOf('opera') != -1);
		var isIE = (ua.indexOf('msie') != -1 && !isOpera); // not opera spoof
		if (el.parentNode === null || (el.style != null && el.style.display == 'none')) {
			return false;
		}
		var parent = null;
		var pos = [];
		var box;
		if (el.getBoundingClientRect) {		 // IE
			box = el.getBoundingClientRect();
			var scrollTop = Math.max(document.documentElement.scrollTop, document.body.scrollTop);
			var scrollLeft = Math.max(document.documentElement.scrollLeft, document.body.scrollLeft);
			return {
				x: box.left + scrollLeft,
				y: box.top + scrollTop
			};
		} 
		else if (document.getBoxObjectFor) { // gecko
			box = document.getBoxObjectFor(el);
			var borderLeft = (el.style.borderLeftWidth) ? parseInt(el.style.borderLeftWidth) : 0;
			var borderTop = (el.style.borderTopWidth) ? parseInt(el.style.borderTopWidth) : 0;
			pos = [box.x - borderLeft, box.y - borderTop];
	    } 
		else {								// safari & opera   
			pos = [el.offsetLeft, el.offsetTop];
			parent = el.offsetParent;
			if (parent != el) {
				while (parent) {
					pos[0] += parent.offsetLeft;
					pos[1] += parent.offsetTop;
					parent = parent.offsetParent;
	            }
	        }
	        
			if (ua.indexOf('opera') != -1 || (ua.indexOf('safari') != -1 && (el.style != null && el.style.position == 'absolute'))) {
				pos[0] -= document.body.offsetLeft;
				pos[1] -= document.body.offsetTop;
			}
		}
		
		if (el.parentNode) {
			parent = el.parentNode;
		}
		else {
			parent = null;
		}

		while (parent && parent.tagName != 'BODY' && parent.tagName != 'HTML') { // account for any scrolled ancestors
			pos[0] -= parent.scrollLeft;
			pos[1] -= parent.scrollTop;
			if (parent.parentNode) {
				parent = parent.parentNode;
			}
			else {
				parent = null;
			}
		}
	    return {
			x: pos[0],
			y: pos[1]
		};
	}, 
	/*
	getElementLeft: function(element) {
		var actualLeft = element.offsetLeft;
		var current = element.offsetParent;

		while (current !== null){
			actualLeft += current.offsetLeft;
			current = current.offsetParent;
		}

		return actualLeft;
	}, 
	
	getElementTop: function(element) {
		var actualTop = element.offsetTop;
		var current = element.offsetParent;

		while (current !== null){
			actualTop += current.offsetTop;
			current = current.offsetParent;
		}

		return actualTop;
	}, 
	*/
	
	// the Element is visiabled( å¯ èƒ½ ä¸ èƒ½ è·¨ æµ è§ˆ å™¨)
	isVisible: function(element) {
		return (element.clientHeight > 0 || element.clientWidth > 0);
	}, 
	
	// Calculate the Button Postion
	calculateButtonPos: function(attachedElement, buttonDiv, attachStyle) {
		// alter the button's position
		var btnWidth = buttonDiv.offsetWidth;
		var btnHeight = buttonDiv.offsetHeight;
		var pos = this.getElementPos(attachedElement);
		var beforeChildLeft = pos.x;
		var beforeChildTop = pos.y;
		var divLeft = 0;
		var divTop = 0;
		switch (attachStyle) {
			case AttachStyleEnum.AttachOuterTopLeft: {
				divLeft = beforeChildLeft;
				divTop = beforeChildTop - btnHeight;
				break;
			}
			case AttachStyleEnum.AttachOuterTopRight: {
				divLeft = beforeChildLeft + attachedElement.offsetWidth - btnWidth;
				divTop = beforeChildTop - btnHeight;
				break;
			}
			case AttachStyleEnum.AttachOuterBottomLeft:	{
				divLeft = beforeChildLeft;
				divTop = beforeChildTop + attachedElement.offsetHeight;
				break;
			}
			case AttachStyleEnum.AttachOuterBottomRight: {
				divLeft = beforeChildLeft + attachedElement.offsetWidth - btnWidth;
				divTop = beforeChildTop + attachedElement.offsetHeight;
				break;
			}
			case AttachStyleEnum.AttachInnerTopLeft: {
				divLeft = beforeChildLeft;
				divTop = beforeChildTop;
				break;
			}
			case AttachStyleEnum.AttachInnerTopRight: {
				divLeft = beforeChildLeft + attachedElement.offsetWidth - btnWidth;
				divTop = beforeChildTop;
				break;
			}
			case AttachStyleEnum.AttachInnerBottomLeft: {
				divLeft = beforeChildLeft;
				divTop = beforeChildTop + attachedElement.offsetHeight - btnHeight;
				break;
			}
			case AttachStyleEnum.AttachInnerBottomRight: {
				divLeft = beforeChildLeft + attachedElement.offsetWidth - btnWidth;
				divTop = beforeChildTop + attachedElement.offsetHeight - btnHeight;
				break;
			}
		}
		return {
			x: divLeft, 
			y: divTop
		};
	}, 
	
	// Get The Download Button Element
	getButtonElement: function(attachedElement) {
		for (var i = 0; i < WSCore.attachButtonList.length; i++) {
			if (attachedElement == WSCore.attachButtonList[i].attachedElement) 
				return WSCore.attachButtonList[i].buttonDiv;
		}
	}, 
	
	// Adjuest The Download Button Element
	adjustAttachButtonPos: function() {
		for (var i = 0; i < WSCore.attachButtonList.length; i++) {
			attachedElement = WSCore.attachButtonList[i].attachedElement;
			buttonDiv = WSCore.attachButtonList[i].buttonDiv;
			attachStyle = WSCore.attachButtonList[i].attachStyle;

			var divPos = WSCore.calculateButtonPos(attachedElement, buttonDiv, attachStyle);
			buttonDiv.style.left = divPos.x.toString() + 'px';
			buttonDiv.style.top = divPos.y.toString() + 'px';
		}
	}, 
	
	// Delete The Download Button
	deleteAttachedButton: function(button) {
		for (var i = 0; i < WSCore.attachButtonList.length; i++) {
			if (WSCore.attachButtonList[i].buttonDiv === button) {
				WSCore.attachButtonList.splice(i, 1);
				document.body.removeChild(button);
				break;
			}
		}
	}, 
	
	
	// é™„ åŠ  æŒ‰ é’®
	attachButtonDiv: function(attachedElement, attachStyle, buttonCaption, buttonLink, divId, buttonId) {
		// Create div element
		if (!attachedElement) return;
		var downloadDiv = document.createElement("div");
//		downloadDiv.setAttribute("id", "ws");		//[safari]
		downloadDiv.setAttribute("style", "z-index: 2147483647; background: transparent; position: absolute;");
		if (divId)	downloadDiv.setAttribute("id", divId);

		downloadDiv.style.visibility = 'hidden';

		// Create button element
		var btnDownload = document.createElement("a");
		btnDownload.setAttribute("class", "fantasybutton");
		
		if(this.getBrowserIndent() == "firefox")
			btnDownload.setAttribute("href", buttonLink);
		else if(this.getBrowserIndent() == "chrome")
			btnDownload.setAttribute("onclick", 'WSCore.test("' + buttonLink + '");');
		else if(this.getBrowserIndent() == "safari") {
			//btnDownload.setAttribute("href", "javascript:void(0);");
			btnDownload.setAttribute("href", buttonLink);
			//btnDownload.addEventListener("click", function(){this.blur(); window.location.href = buttonLink; downloadDiv.style.visibility = 'hidden'; return false; });
			btnDownload.addEventListener("click", function(){this.blur(); downloadDiv.style.visibility = 'hidden'; return false; });
			
		}
			
		btnDownload.style.cursor = "pointer";
		var btnText = document.createElement("span");
		if (buttonCaption) btnText.innerHTML = buttonCaption;
		btnDownload.appendChild(btnText);

		downloadDiv.appendChild(btnDownload);     
		var body = document.body;
		body.insertBefore(downloadDiv, body.lastChild);

		var divPos = this.calculateButtonPos(attachedElement, downloadDiv, attachStyle);

		downloadDiv.style.left = divPos.x.toString() + 'px';
		downloadDiv.style.top = divPos.y.toString() + 'px';

		// initial onresize event
		if (!this.isInitialAdjustPos) {
			window.addEventListener("resize", WSCore.adjustAttachButtonPos, false);
			//window.addEventListener("DOMNodeInserted", WSCore.adjustAttachButtonPos, false);
			this.isInitialAdjustPos = true;
		}

		// push attachButtonInfo into attachButtonList
		var attachButtonInfo = {attachedElement: attachedElement, buttonDiv: downloadDiv, attachStyle: attachStyle};
		WSCore.attachButtonList.push(attachButtonInfo);

		return downloadDiv;
	},
	
	// ä¸‹ æ‹‰ èœ å• ç›¸ å…³
	//////////////////// dropdown menu global variants and functions ////////////////////
	
	// open hidden layer
	mopen: function(id) {
		// cancel close timer
		WSCore.mcancelclosetime();

		// close old layer
		if (WSCore.ddmenuitem) WSCore.ddmenuitem.style.visibility = 'hidden';

		// get new layer and show it
		WSCore.ddmenuitem = document.getElementById(id);
		if (WSCore.ddmenuitem)
		{
			WSCore.ddmenuitem.style.visibility = 'visible';
		}
	}, 
	
	// close showed layer
	mclose: function() {
		if (WSCore.ddmenuitem) WSCore.ddmenuitem.style.visibility = 'hidden';
	}, 
	
	// go close timer
	mclosetime: function() {
		WSCore.closetimer = window.setTimeout(WSCore.mclose, WSCore.timeout);
	}, 
	
	// cancel close timer
	mcancelclosetime: function() {
		if (WSCore.closetimer) {
			window.clearTimeout(WSCore.closetimer);
			WSCore.closetimer = null;
		}
	}, 
	
	showElement: function(tipElement) {
		if (WSCore.timeoutHandle) clearTimeout(this.timeoutHandle);
		if (tipElement) {
			tipElement.style.visibility = "visible";
		}
	}, 
		
	openExternalLink: function(url) {
		myWindow1 = window.open(url, '_blank', '');
        myWindow1.focus();
		window.setTimeout(function(){myWindow1.close();}, 500);
	},
	
	test: function(url) {
		WSCore.openExternalLink(url); WSCore.mclose(); 
		//downloadDiv.style.visibility = 'hidden';
	}, 
	
	// é™„ åŠ  ä¸‹ æ‹‰ æŒ‰ é’® èœ å•
	attachDropdownMenu: function(attachedElement, attachStyle, buttonCaption, itemArray, divId, buttonId) {
		// Create div element
		if (!attachedElement || !itemArray) return;
		var downloadDiv = document.createElement("div");
		downloadDiv.setAttribute("style", "z-index: 2147483647; background: transparent; position: absolute;");
		if (divId)	downloadDiv.setAttribute("id", divId);

		downloadDiv.style.visibility = 'hidden';

		// Create menu element
		var ulElement = document.createElement("ul");
		ulElement.setAttribute("id", "mytubem");
		var liElement = document.createElement("li");
		ulElement.appendChild(liElement);
		var btnElement = document.createElement("a");
		btnElement.setAttribute("href", "javascript:void(0);");
		btnElement.setAttribute("class", "fantasybutton");
		if (buttonCaption) btnElement.innerHTML = buttonCaption;
		// tag a addEventListener
		var guid = this.newGuid();
		btnElement.addEventListener("click", function() { this.blur(); WSCore.mopen(guid); return false; }, false);
		btnElement.addEventListener("mouseover", function() { WSCore.mcancelclosetime() }, false);
		btnElement.addEventListener("mouseout", function() { WSCore.mclosetime() }, false);

		liElement.appendChild(btnElement);
		var divMenu = document.createElement("div");
		divMenu.setAttribute("id", guid);
		// tag div addEventListener
		divMenu.addEventListener("mouseover", function() { WSCore.mcancelclosetime() }, false);
		divMenu.addEventListener("mouseout", function() { WSCore.mclosetime() }, false);

		liElement.appendChild(divMenu);	
		for (var i = 0; i < itemArray.length; i++) {
			var url = itemArray[i][1] ? itemArray[i][1] : "#";
			var aItem = document.createElement("a");
			if(this.getBrowserIndent() == "chrome")
				aItem.setAttribute("onclick", 'WSCore.test("' + url + '");');
			else {	//	Firefox & Safari
				aItem.setAttribute("href", url);
				aItem.addEventListener("click", function() { WSCore.mclose(); downloadDiv.style.visibility = 'hidden'; }, false);
			}
			aItem.style.cursor = "pointer";
			aItem.innerHTML = itemArray[i][0];
			divMenu.appendChild(aItem);
		}

		downloadDiv.appendChild(ulElement);
		var body = document.body;
		body.insertBefore(downloadDiv, body.lastChild);

		var divPos = this.calculateButtonPos(attachedElement, downloadDiv, attachStyle);

		downloadDiv.style.left = divPos.x.toString() + 'px';
		downloadDiv.style.top = divPos.y.toString() + 'px';

		// initial onresize event
		if (!this.isInitialAdjustPos) {
			window.addEventListener("resize", WSCore.adjustAttachButtonPos, false);
			//window.addEventListener("DOMNodeInserted", WSCore.adjustAttachButtonPos, false);
			this.isInitialAdjustPos = true;
		}

		// push attachButtonInfo into attachButtonList
		var attachButtonInfo = {attachedElement: attachedElement, buttonDiv: downloadDiv, attachStyle: attachStyle};
		WSCore.attachButtonList.push(attachButtonInfo);

		return downloadDiv;
	},
    
    // ç”¨ äºŽ ä¸‹ è½½ list åˆ— è¡¨ çš„ button
    attachButtonDivForPlayList: function(attachedElement, attachStyle, buttonCaption, buttonLink, divId, buttonId){
		// Create div element
		if (!attachedElement) return;
		var downloadDiv = document.createElement("div");
		downloadDiv.setAttribute("style", "z-index: 2147483647; background: transparent; float:right;");
		if (divId)	downloadDiv.setAttribute("id", divId);

		downloadDiv.style.visibility = 'visible';

		// Create button element
		var btnDownload = document.createElement("a");
		btnDownload.setAttribute("class", "wsplaylistbutton");

		if(this.getBrowserIndent() == "firefox")
			btnDownload.setAttribute("href", buttonLink);
		else if(this.getBrowserIndent() == "chrome")
			btnDownload.setAttribute("onclick", 'WSCore.test("' + buttonLink + '");');
		else if(this.getBrowserIndent() == "safari") {
			btnDownload.setAttribute("href", "javascript:void(0);");
			btnDownload.addEventListener("click", function(){ this.blur(); if (buttonLink) window.location.href = buttonLink; downloadDiv.style.visibility = 'visible'; return false; });
		}

		btnDownload.style.cursor = "pointer";
		var btnText = document.createElement("span");
		if (buttonCaption) btnText.innerHTML = buttonCaption;
		btnDownload.appendChild(btnText);

		downloadDiv.appendChild(btnDownload);     
		
		var parent = attachedElement.parentNode;
		parent.insertBefore(downloadDiv, attachedElement);

         var divPos = this.getElementPos(attachedElement);
        switch(attachStyle){
	       case AttchStyleForPlayList.AttachOuterCenterLeft:{
	            downloadDiv.style.right = attachedElement.offsetWidth + 30 + 'px';// playlist,channel,user
		        break;
	       }
	       case AttchStyleForPlayList.AttachOuterCenterRightAtMiddle:{
	            downloadDiv.style.paddingLeft = attachedElement.offsetWidth + 'px'; // watch_later
		        break;
	       }
	       case AttchStyleForPlayList.AttachOuterCenterRightAtTop:{
		        divPos.x += attachedElement.offsetWidth;
		        divPos.y += 0;
		        break;
	       }
	       default:
	            break;
        }
        
        downloadDiv.style.zIndex = attachedElement.style.zIndex;

		// initial onresize event
		if (!this.isInitialAdjustPos) {
/* 			window.addEventListener("resize", WSCore.adjustAttachButtonForListPos, false); */
			//window.addEventListener("DOMNodeInserted", WSCore.adjustAttachButtonPos, false);
			this.isInitialAdjustPos = true;
		}

		// push attachButtonInfo into attachButtonList
		 var attachButtonInfo = {attachedElement: attachedElement, buttonDiv: downloadDiv, attachStyle: attachStyle};
		 WSCore.attachButtonList.push(attachButtonInfo);

		return downloadDiv;	
    },

	adjustAttachButtonForListPos: function() {
		for (var i = 0; i < WSCore.attachButtonList.length; i++) {
			attachedElement = WSCore.attachButtonList[i].attachedElement;
			buttonDiv = WSCore.attachButtonList[i].buttonDiv;
			attachStyle = WSCore.attachButtonList[i].attachStyle;

			var divPos = WSCore.getElementPos(attachedElement);
	        switch(attachStyle){
		       case AttchStyleForPlayList.AttachOuterCenterLeft:{
			        divPos.x -= buttonDiv.offsetWidth + 6;
			        break;
		       }
		       case AttchStyleForPlayList.AttachOuterCenterRightAtMiddle:{
			        divPos.x += attachedElement.offsetWidth;
			        divPos.y += attachedElement.offsetHeight / 2 - buttonDiv.offsetHeight / 2;

			        break;
		       }
		       case AttchStyleForPlayList.AttachOuterCenterRightAtTop:{
			        divPos.x += attachedElement.offsetWidth;
			        divPos.y += 0;

			        break;
		       }
		       default:
		            break;
	        }

			buttonDiv.style.left = divPos.x.toString() + 'px';
			buttonDiv.style.top = divPos.y.toString() + 'px';
		}
	},
	
	hideElement: function(tipElement) {
		if (WSCore.timeoutHandle) clearTimeout(this.timeoutHandle);
		if (tipElement) {
			tipElement.style.visibility = "hidden";
		}
	}, 

	delayHideElement: function(tipElement) {
		WSCore.timeoutHandle = setTimeout(function() { WSCore.hideElement(tipElement) }, 500);
	}, 

	// bind the mouse over event.
	bind_mouseover: function(divElement, tipElement) {
		if (typeof(divElement) == "string") {
			divElement = document.getElementById(divElement);
			tipElement = document.getElementById(tipElement);
		}
		if (divElement == null || tipElement == null)
			return;

		divElement.addEventListener("mouseover", this.onShowElement = function() { WSCore.adjustAttachButtonPos(); WSCore.showElement(tipElement); }, false);
		divElement.addEventListener("mouseout", this.onDelayHideElement = function() { WSCore.delayHideElement(tipElement); }, false);

		tipElement.addEventListener("mouseover", function() { WSCore.showElement(tipElement); }, false);
		tipElement.addEventListener("mouseout", function() { WSCore.delayHideElement(tipElement); }, false);
		
		WSCore.showElement(divElement);
		WSCore.showElement(tipElement);
	}, 
	
	// unbind the mouse over event
	unbind_mouseover: function(divElement, tipElement) {
		if (typeof(divElement) == "string") {
			divElement = document.getElementById(divElement);
			tipElement = document.getElementById(tipElement);
		}
		if (this.onShowElement && divElement) {
			divElement.removeEventListener("mouseover", WSCore.onShowElement, false);
		}
		
		if (this.onDelayHideElement && divElement) {
			divElement.removeEventListener("mouseout", WSCore.onDelayHideElement, false);
		}

		if (this.onShowElement && tipElement) {
			tipElement.removeEventListener("mouseover", WSCore.onShowElement, false);
		}
		
		if (this.onDelayHideElement && tipElement) {
			tipElement.removeEventListener("mouseout", WSCore.onDelayHideElement, false);
		}
	},
	
		// æ å–Flash çš„ å‚ æ•°
	extractFlashvars: function(node) {
		var element = node;
		if (element === undefined || (typeof(element) != "object" && typeof(element) != "function")) {
			element = document;
		}
		var objectLists;
		if (element instanceof HTMLObjectElement) {
			objectLists = [];
			objectLists.push(element);
		}
		else {
			objectLists = element.getElementsByTagName("object");
		}
		var flashvars = null;
		for (var i = 0; i < objectLists.length; i++) {
			paramLists = objectLists[i].childNodes;
			for (var j = 0; j < paramLists.length; j++) {
				if (paramLists[j].nodeType != Node.ELEMENT_NODE) continue;
				var tempVars = paramLists[j].getAttribute("name");
				if (tempVars == "flashvars") {
					flashvars = paramLists[j].getAttribute("value");
					break;
				}
			}
			if (flashvars) break;
		}

		if (!flashvars) {
			var embedLists;
			if (element instanceof HTMLObjectElement) {
				embedLists = [];
				embedLists.push(element);
			}
			else {
				embedLists = element.getElementsByTagName("embed");
			}
			for (var i = 0; i < embedLists.length; i++) {
				flashvars = embedLists[i].getAttribute("flashvars");
				if (flashvars) break;
			}
		}

		return flashvars;
	}, 

	// æ å–Flash å‚ æ•° æ•° ç»„
	extractFlashvarsArr: function(node) {
		var element = node;
		if (element === undefined || (typeof(element) != "object" && typeof(element) != "function")) {
			element = document;
		}
		var objectLists = element.getElementsByTagName("object");
		var flashvars = new Array();
		for (var i = 0; i < objectLists.length; i++) {
			paramLists = objectLists[i].childNodes;
			for (var j = 0; j < paramLists.length; j++) {
				if (paramLists[j].nodeType != Node.ELEMENT_NODE) continue;
				var tempVars = paramLists[j].getAttribute("name");
				if (tempVars == "flashvars") {
					flashvars.push(paramLists[j].getAttribute("value"));
					break;
				}
			}
		}

		if (flashvars.length <= 0) {
			var embedLists = element.getElementsByTagName("embed");
			for (var i = 0; i < embedLists.length; i++) {
				flashvars.push(embedLists[i].getAttribute("flashvars"));
			}
		}

		return flashvars;
	}, 
	
	// æ å–Flash æ’­ æ”¾ å‚ æ•°
	extractFlashSrc: function(node) {
		// æå–Flashçš„åœ°å€ä¸Žå‚æ•°
		if (node == undefined ||(typeof(node) != "object" && typeof(node) != "function")) node = document;
		var flashNode = node.getElementsByTagName("object");
		var src, flashvars;
		if (flashNode && flashNode.length > 0) {
			var isFindVisibleNode = false;
			for (var i = 0; i < flashNode.length; i++) {
				if (WSCore.isVisible(flashNode[i])) {
					flashNode = flashNode[i];
					isFindVisibleNode = true;
					break;
				}
			}
			if (isFindVisibleNode) {
				var objectParams = flashNode.childNodes;
				for (var i = 0; i < objectParams.length; i++) {
					if (objectParams[i].nodeType != Node.ELEMENT_NODE) continue;
					var tempVars = objectParams[i].getAttribute("name");
					if (tempVars == "flashvars") {
						flashvars = objectParams[i].getAttribute("value");
						break;
					}
				}
				src = flashNode.getAttribute("data");
			}
		}
		
		if (!isFindVisibleNode) {
			flashNode = node.getElementsByTagName("embed");
			if (flashNode) {
				var isFindVisibleNode = false;
				for (var i = 0; i < flashNode.length; i++) {
					if (WSCore.isVisible(flashNode[i])) {
						flashNode = flashNode[i];
						isFindVisibleNode = true;
						break;
					}
				}
				if (!isFindVisibleNode) return;
				
				src = flashNode.getAttribute("src");
				flashvars = flashNode.getAttribute("flashvars");
			}
		}
		
		if ((src && src.length > 0) && (flashvars && flashvars.length > 0)) {
			src += "?" + flashvars;
		}
		return src;
	}, 
	
	// æ å–Flash å…ƒ ç´ 
	extractFlashElement: function(node) {
		// æ å–Flash çš„ åœ° å€ ä¸Ž å‚ æ•°
		if (node == undefined || (typeof(node) != "object" && typeof(node) != "function")) node = document;
		var flashNode = node.getElementsByTagName("object");
		if (flashNode && flashNode.length > 0) {
			var isFindVisibleNode = false;
			for (var i = 0; i < flashNode.length; i++) {
				if (WSCore.isVisible(flashNode[i])) {
					flashNode = flashNode[i];
					isFindVisibleNode = true;
					break;
				}
			}
		}
		
		if (!isFindVisibleNode) {
			flashNode = node.getElementsByTagName("embed");
			if (flashNode) {
				var isFindVisibleNode = false;
				for (var i = 0; i < flashNode.length; i++) {
					if (WSCore.isVisible(flashNode[i])) {
						flashNode = flashNode[i];
						isFindVisibleNode = true;
						break;
					}
				}
				if (!isFindVisibleNode) return;
			}
		}

		return flashNode;
	},

	// èŽ· å– ç½‘ é¡µ æ ‡ é¢˜
	getWebTitle: function() {
		kdocTitle = document.title;	// æ ‡ é¢˜
		if (kdocTitle == null) {
			var t_titles = document.getElementsByTagName("title");
			if (t_titles && t_titles.length > 0)
			{
				kdocTitle = t_titles[0];
			}else {
				kdocTitle = "";
			}
		}
		return kdocTitle;
	}, 
	
	base64Encode: function(input) {
		var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var output = "";
		var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
		var i = 0;
		input = this._utf8_encode(input);
		while (i < input.length) {
			chr1 = input.charCodeAt(i++);
			chr2 = input.charCodeAt(i++);
			chr3 = input.charCodeAt(i++);
			enc1 = chr1 >> 2;
			enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
			enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
			enc4 = chr3 & 63;
			if (isNaN(chr2)) {
				enc3 = enc4 = 64;
			} else if (isNaN(chr3)) {
				enc4 = 64;
			}
			output = output +
			_keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
			_keyStr.charAt(enc3) + _keyStr.charAt(enc4);
		}
		return output;
	},
	
	_utf8_encode: function(string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
			} else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			} else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
 
		}
		return utftext;
	},
	
	getBrowserIndent: function()
	{
		var ua = window.navigator.userAgent.toLowerCase();

		if(ua.indexOf("chrome")>0) {
			return "chrome";
		}
		else if(ua.indexOf("firefox")>0){
			return "firefox";
		}
		else if(ua.indexOf("safari")>0) {
			return "safari";
		} 
		else {
			return "";
		} 
	},
	
	targetObject: function(event)
	{
		if(this.getBrowserIndent() != "firefox") {
			return event.target ;
		}
		else {
			return event.originalTarget ;
		}
	},
};