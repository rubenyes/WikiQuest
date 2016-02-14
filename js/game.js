
	//variables
	var startURL ='';
	var targetURL='';
	var historyURL = [];
	var currentURLIndex = 0;
	var numberOfBacks = 0;
	var userData;
	var connector = new fbConnector('https://wikiquest.firebaseio.com/matches');
	var currentMatchConnector;
	//functions
	function handleWin(){
		if(currentMatchConnector){
			currentMatchConnector.patch({
				winner:{
					name: userData.username,
					backs: numberOfBacks,
					start: startURL,
					end: targetURL,
					pages: historyURL
			}
		});
		}
		else{
			alert("You won, but of course you were alone.")
			window.location.href = 'index.html';
		}
	}
	function pushURLHistory(pageName){

		if (currentURLIndex > historyURL.length -1){
			currentURLIndex++;
			historyURL.push(pageName);
		}
		else {
			historyURL[currentURLIndex++] = pageName;
		}
		if(pageName == targetURL){
			handleWin();
		}
		displayHistory();
	}
	function setCurrentURLIndex(index){
		currentURLIndex = index;
	}
	function getBackInHistory(pageName,index){
		setCurrentURLIndex(index );
		callWikipediaAPI(pageName);
		numberOfBacks++;
	}
	function displayHistory(){
		var historyList = document.getElementById('historyList');
		historyList.innerHTML ='';
		for (var i = 0; i < currentURLIndex; i++) {
		 	var item = document.createElement('li');
		 	var link = document.createElement('a');
			$(link).attr('href','javascript:getBackInHistory("'+historyURL[i].replace(/"/g, '\\"')+'","'+i+'")');

			link.innerHTML = historyURL[i];
			item.appendChild(link);
			historyList.appendChild(item);
		 };

	}
	function isAnchor(ref){
		return ref[0]=='#';
	}
	function isInnerLink(ref){
		return ref[0]=='/' && ref[1]=='w' && ref[2]!='/'
	}
	var wikipediaHTMLResult = function(data) {
		var wikiFrame= document.getElementById('wikiFrame');
		var readData = $('<div id="content" role="main">' + data.parse.text['*'] + '</div>');
			// handle redirects
		var redirect = readData.find('.redirectText a').text();
		if(redirect != '') {
			callWikipediaAPI(redirect);
		return;
		}
		//start handling*/
		//patch a tags
		$(readData).find( 'a' ).each(function() {
			var oldRef = $(this).attr('href');
			var newRef='';
			if(oldRef) {
				if (isAnchor(oldRef)) newRef = oldRef;
				else if (isInnerLink(oldRef)) {
					var index = oldRef.lastIndexOf('/');
					var pageName= decodeURIComponent(oldRef.substring(index+1));
					newRef = 'javascript:callWikipediaAPI("'+pageName.replace(/"/g, '\\"')+'");';
				}
				else newRef='#';
				$(this).attr('href', newRef);
			}
		});
		//patch img
		$(readData).find( 'img' ).each(function() {
			var oldSrc = $(this).attr('src');
			var newSrc = 'https:'+oldSrc;
			$(this).attr('src', newSrc);
			$(this).attr('srcset', '');
		});
		//done patching
		wikiFrame.innerHTML='';
		var header = document.createElement('h1');
		header.className ='firstHeading';
		header.innerHTML = data.parse.title;
		$(readData).prepend(header);
		$(wikiFrame).append(readData);
		$(wikiFrame).scrollTop(0);
		//$('#'+id)[0].scrollTop = $('#'+id)[0].scrollHeight;
		//history handling
		pushURLHistory(data.parse.title);

	};

	var wikipediaSummaryResult = function(data){
		var pageData;
		for( page in data.query.pages) {
			pageData = data.query.pages[page];
		}
		var wikiTargetFrame= document.getElementById('wikiTargetFrame');
		var summary= pageData.extract;
		//check for first image
		if(pageData.thumbnail){
			var firstImage = document.createElement('img');
			//https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Killian_memos_MSWord_animated.gif/50px-Killian_memos_MSWord_animated.gif
			var oldSrc = pageData.thumbnail.source;
			var lindex = oldSrc.lastIndexOf('/');
			var newSrc = oldSrc.substring(0,lindex);
			$(firstImage).attr('src', newSrc + '/400px-'+pageData.pageimage);
		}
		var header = document.createElement('h1');
		header.className ='firstHeading';
		header.innerHTML = pageData.title;
		var readData = $('<div id="content"></div>');;
		$(readData).append(header);
		$(readData).append(firstImage);
		$(readData).append(summary);
		$(wikiTargetFrame).append(readData);
		$(wikiTargetFrame).scrollTop(0);
	};
	function callWikipediaAPI(wikipediaPage, summary) {
		if(summary){
			wikiAPI.getExtract(wikipediaPage,wikipediaSummaryResult);
		}
		else{
			wikiAPI.getPage(wikipediaPage, wikipediaHTMLResult);
		}
	}

	function setArticle(page , dest){
		if(dest=='start'){
			startURL= page;
			callWikipediaAPI(startURL);
		}
		if(dest=='end'){
			targetURL= page;
			callWikipediaAPI(targetURL,true);
		}
	}
	function getUrlVars() {
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    return vars;
	}

	$( document ).ready(function() {
		userData = getUrlVars();
		console.log(userData);
		if(userData.username){
			userData.username = decodeURIComponent(userData.username);
			document.getElementById('userSpan').innerHTML=userData.username;
		}
		if(userData.match && userData.match != 'solo'){
			currentMatchConnector = new fbConnector('https://wikiquest.firebaseio.com/matches/' + userData.match);
			currentMatchConnector.onChange(function(match){
				if(match.winner){
					var winName = match.winner.name;
					var winBack = match.winner.backs;
					var winStart = match.winner.start;
					var winEnd = match.winner.end;
					var winAlert = 'Winner: '+winName+'\n'+'Quest:'+winStart+' >> '
						+winEnd+'\n'+'Returns: '+winBack+'\n\n'+'Path:\n';
					Object.keys(match.winner.pages).forEach(function(page,index) {
					    winAlert+= index+': ' + match.winner.pages[page]+'\n';
					});

					alert(winAlert);
					currentMatchConnector.delete();
					window.location.href = 'index.html';
				}
			});
		}
		wikiAPI.getRandomArticleName(function(page){setArticle(page,'start')});
		wikiAPI.getRandomArticleName(function(page){setArticle(page,'end')});
	});
