//module for matchmaking
//connector is a function reference to create a connector
function Matchmaking (connector, baseUrl){
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
