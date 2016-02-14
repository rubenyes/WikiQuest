//module for matchmaking
//connector is a function reference to create a connector
function MatchMaking (connector, baseUrl){
  var matchesConnector = new connector(baseUrl + '/matches');
  var currentMatchConnector;
  var currentMatchKey;
  var hosting;
  var userKey;
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
  var canceledMatch = function(){
    var event = new Event('match_canceled');
    dispatchEvent(event);
    if(hosting){
      hosting = false;
    }
    else{
      currentMatchConnector.offChange();
      currentMatchConnector.offChildAdded();
      currentMatchKey = false;
      userKey = false;
    }
  };
//listeners for connection
matchesConnector.onChildAdded(function (key, val){
  var event = new CustomEvent('match_added', { 'match': val });
  dispatchEvent(event);
});
matchesConnector.onChildRemoved (function (key, val){
  var event = new CustomEvent('match_removed', { 'match': val });
  dispatchEvent(event);
  if(key == currentMatchKey) {
    canceledMatch();
  }
});
//end listeners
  this.createMatch = function (username){
    matchesConnector.post({
      creator: username,
      started: false
    }).then(function (matchKey){
      currentMatchKey = matchKey;
      currentMatchConnector = new connector(baseUrl + '/matches/'+matchKey);
      hosting = true;
      var event = new CustomEvent('create_match', { 'key': matchKey });
      dispatchEvent(event);
    });
  };
  this.joinMatch = function(matchKey, newUsername){
    matchCleanup();
    currentMatchKey = matchKey;
    hosting = false;
    var matchConnector = new connector(baseUrl + '/matches/'+matchKey+'/users');
    matchConnector.post(newUsername).then(function(key){
      userKey = key;
    });
    var event = new CustomEvent('change_match', { 'key': matchKey });
    dispatchEvent(event);
  };
  this.startMatch = function(matchKey){
    var event;
    var event = new CustomEvent('start_match', { 'key': matchKey });
    if(matchKey != 'solo'){
      var matchConnector = new connector(baseUrl + '/matches/'+matchKey);
      matchConnector.patch({started: true});
    }
    dispatchEvent(event);
  };
}
