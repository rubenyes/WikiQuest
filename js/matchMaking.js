//module for matchmaking
//connector is a function reference to create a connector
function MatchMaking (connector, baseUrl){
  var matchesConnector = new connector(baseUrl + '/matches');
  var currentMatchConnector;
  var currentMatchKey;
  var hosting;
  var userKey;
  var username;
  var matchCleanup = function (){
    if(currentMatchKey){
      currentMatchConnector.offChange();
      currentMatchConnector.offChildAdded();
      if(hosting){
        currentMatchConnector.delete();
      }
      else{
        var userInMatchConnector = new connector(
          baseUrl + '/matches/'+ currentMatchKey + '/users/'+ userKey);
        userInMatchConnector.delete();
      }
    }
  };
  var listenForStart = function(){
    currentMatchConnector.onChange(function(match){
      if(match.started){
        start();
      }
    });
  };
  var canceledMatch = function(){
    var event;
    if(hosting){
      hosting = false;
      event = new Event('match_canceled_by_me');
    }
    else{
      event = new Event('match_canceled_by_host');
      currentMatchConnector.offChange();
      currentMatchConnector.offChildAdded();
      currentMatchKey = false;
      userKey = false;
    }
    dispatchEvent(event);
  };
//listeners for connection
matchesConnector.onChildAdded(function (key, val){
  var event = new CustomEvent('match_added', { detail:{'match': val, 'key': key}});
  dispatchEvent(event);
});
matchesConnector.onChildRemoved (function (key, val){
  var event = new CustomEvent('match_removed', { detail:{'match': val, 'key': key}});
  dispatchEvent(event);
  if(key == currentMatchKey) {
    canceledMatch();
  }
});
//end listeners
  this.createMatch = function (newUsername){
    matchesConnector.post({
      creator: newUsername,
      started: false
    }).then(function (matchKey){
      currentMatchKey = matchKey;
      currentMatchConnector = new connector(baseUrl + '/matches/'+matchKey);
      hosting = true;
      username =newUsername;
      currentMatchConnector.get().then(function(val){
        var event = new CustomEvent('create_match', { detail:{'match': val, 'key': currentMatchKey}});
        dispatchEvent(event);
      });
    });
  };
  this.joinMatch = function(matchKey, newUsername){
    matchCleanup();
    currentMatchKey = matchKey;
    currentMatchConnector = new connector(baseUrl + '/matches/'+matchKey);
    hosting = false;
    username =newUsername;
    var matchConnector = new connector(baseUrl + '/matches/'+matchKey+'/users');
    matchConnector.post(newUsername).then(function(key){
      userKey = key;
    });
    listenForStart();
    currentMatchConnector.get().then(function(val){
      var event = new CustomEvent('change_match', { detail:{'match': val, 'key': currentMatchKey}});
      dispatchEvent(event);
    });
  };
  function start(solo){
    var event;
    if(!solo){
      event = new CustomEvent('start_match', { detail:{'key': currentMatchKey, 'user': username}});
      var matchConnector = new connector(baseUrl + '/matches/'+currentMatchKey);
      matchConnector.patch({started: true});
    }
    else{
      event = new CustomEvent('start_match', { detail:{'key': 'solo', 'user': 'loner'}});
    }
    dispatchEvent(event);
  };
  this.startMatch = start;
}
