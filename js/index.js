    //variables
    var matchMaking = new MatchMaking(fbConnector, 'https://wikiquest.firebaseio.com');
    //main
    $( document ).ready(function() {
        document.getElementById("startButton").style.visibility = "hidden";
        //register events from matchmaking
        addEventListener('match_canceled_by_me', function (e) {
          alert('You canceled the match');
        }, false);
        addEventListener('match_canceled_by_host', function (e) {
          document.getElementById('info-key').innerHTML = '';
          document.getElementById('info-creator').innerHTML = '';
          document.getElementById('info-users').innerHTML = '';
           alert('Host canceled match');
        }, false);
        addEventListener('match_added', function (e) {
          displayMatches(e.detail.key, e.detail.match);
        }, false);
        addEventListener('match_removed', function (e) {
          var removed = document.getElementById(e.detail.key);
          if(removed){
              $(removed).remove();
          }
        }, false);
        addEventListener('create_match', function (e) {
          displayMatchInfo(e.detail.key, e.detail.match);
          document.getElementById("startButton").style.visibility = "visible";
        }, false);
        addEventListener('change_match', function (e) {
          document.getElementById("startButton").style.visibility = "hidden";
            displayMatchInfo(e.detail.key, e.detail.match);
        }, false);
        addEventListener('start_match', function (e) {
          alert('Match Started');
          if(e.detail.key == 'solo')
              window.location.href = 'game.html?match=solo&username=loner';
          else
            window.location.href = 'game.html?match='+e.detail.key+'&username='+e.detail.user;
        }, false);

    });

    //display functions
    function displayMatches(key, match){
        var matchList = document.getElementById('matchesList');
        //display on left side
        if(!match.started){
            var creator = match.creator;
            var li = document.createElement('li');
            li.id = key;
            var a = document.createElement('a');
            a.href = 'javascript:joinButton("'+key+'")';
            a.innerHTML = creator;
            li.appendChild(a);
            matchList.appendChild(li);
        }
    }
    function displayMatchInfo(key, match){
    	//display current match info, creator, users in it etc
        document.getElementById('info-key').innerHTML = key;
        document.getElementById('info-creator').innerHTML = match.creator;
        var ulist = document.getElementById('info-users');
        ulist.innerHTML ='';
        if(match.users){
          Object.keys(match.users).forEach(function(ukey,index) {
            var span = document.createElement('span');
            span.className = 'info';
            span.innerHTML += match.users[ukey]+', ';
            ulist.appendChild(span);
          });
        }
    }
    function displayUsernameError(){
    	alert('You need type a username');
    }
    //button & handlers
    function startButton(){
        var username = $('#nameInput').val();
        if(username != ''){
            matchMaking.startMatch();
        }
        else{
            displayUsernameError();
        }
    }
    function createButton(){
    	var username = $('#nameInput').val();
    	if(username != ''){
    		matchMaking.createMatch(username);
    	}
    	else{
    		displayUsernameError();
    	}
    }
    function joinButton(key){
        var username = $('#nameInput').val();
        if(username != ''){
            matchMaking.joinMatch(key, username);
        }
        else{
            displayUsernameError();
        }
    }
