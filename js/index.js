    //variables
    var matchMaking = new MatchMaking(fbConnector, 'https://wikiquest.firebaseio.com');
    var fireRef = new Firebase("https://wikiquest.firebaseio.com/");
    var matchesRef = fireRef.child("matches");
    var currentMatchRef;
    var hosting; //my own match
    var prevUsername;
    //main
    $( document ).ready(function() {
        document.getElementById("startButton").style.visibility = "hidden";
        matchesRef.on('child_added', function(childSnapshot, prevChildKey) {
            displayMatches(childSnapshot);
        });
        matchesRef.on('child_removed', function(oldChildSnapshot){
            var removed = document.getElementById(oldChildSnapshot.key());
            if(removed){
                $(removed).remove();
                if(oldChildSnapshot.key()==currentMatchRef.key()){
                    canceledMatch();
                }
            }
        });
    });

    //functions
    function createMatch(username){
    	var newMatchRef = matchesRef.push({
		    creator: username,
		    started: false
		  });
        changeRef(newMatchRef);
        hosting = true;
        document.getElementById("startButton").style.visibility = "visible";
    }
    function joinMatch(matchKey, username){
    	//asign and display current joined match, USRNAME check
        changeRef(matchesRef.child(matchKey).ref());
        prevUsername=currentMatchRef.child('users').push(username);

    }
    function startMatch(solo){
    	//send to other URL and send the currentMatchKey
        if(solo){
            window.location.href = 'game.html?match=solo&username=loner';
        }
        else{
            currentMatchRef.child('started').set(true);
        }
    }
    function canceledMatch(){
        if(!hosting){ //only guests info needs adjusting
            currentMatchRef.off();
            currentMatchRef ='';
            prevUsername='';
            document.getElementById('info-key').innerHTML = '';
            document.getElementById('info-creator').innerHTML = '';
            document.getElementById('info-users').innerHTML = '';
             alert('Host canceled match');
        }
        else{
            hosting = false;
             alert('You canceled the match');
        }
    }
    //display functions
    function displayMatches(childSnapshot){
        var matchList = document.getElementById('matchesList');
        //display on left side
        if(!childSnapshot.child('started').val()){
            var key = childSnapshot.key();
            var creator = childSnapshot.child('creator').val();
            var li = document.createElement('li');
            li.id = key;
            var a = document.createElement('a');
            a.href = 'javascript:joinButton("'+key+'")';
            a.innerHTML = creator;
            li.appendChild(a);
            matchList.appendChild(li);
        }
    }
    function displayMatchInfo(matchSnapShot){
    	//display current match info, creator, users in it etc
        document.getElementById('info-key').innerHTML = matchSnapShot.key();
        document.getElementById('info-creator').innerHTML = matchSnapShot.child('creator').val();
        var ulist = document.getElementById('info-users');
        ulist.innerHTML ='';
        if(matchSnapShot.hasChild('users')){
            matchSnapShot.child('users').forEach(function(childSnapshot) {
                var span = document.createElement('span');
                span.className = 'info';
                span.innerHTML += childSnapshot.val()+', ';
                ulist.appendChild(span);
            });
        }
    }
    function displayUsernameError(){
    	alert('You need type a username');
    }
    function changeRef(newRef){
        //Check if match was set
        if(currentMatchRef){ //kill old listeners.
            currentMatchRef.off();
            if(hosting){ //remove match alltogether
                currentMatchRef.remove();
            }
            else{
                currentMatchRef.child('users').child(prevUsername.key()).remove();
            }
        }
        currentMatchRef = newRef;
        hosting=false;
        document.getElementById("startButton").style.visibility = "hidden";
        currentMatchRef.on('value',function(dataSnapshot){
            displayMatchInfo(dataSnapshot);
            if(dataSnapshot.child('started').val()){
                var username = $('#nameInput').val();
                var key=currentMatchRef.key();
                alert('Match Started');
                window.location.href = 'game.html?match='+key+'&username='+username;
            }
        });

    }
    //button & handlers
    function startButton(){
        var username = $('#nameInput').val();
        if(username != ''){
            startMatch();
        }
        else{
            displayUsernameError();
        }
    }
    function createButton(){
    	var username = $('#nameInput').val();
    	if(username != ''){
    		createMatch(username);
    	}
    	else{
    		displayUsernameError();
    	}
    }
    function joinButton(key){
        var username = $('#nameInput').val();
        if(username != ''){
            joinMatch(key, username);
        }
        else{
            displayUsernameError();
        }
    }
