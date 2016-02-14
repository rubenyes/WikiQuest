var baseURL = 'https://wikiquest.firebaseio.com/t';
//connector Firebase tests
QUnit.test( "fbConnector RESTful-ish test", function( assert ) {
  var done = assert.async();
  var connector = new fbConnector(baseURL);
  connector.post({test: true}).then(function(key){
    connector2 = new fbConnector(baseURL+'/'+key);
    assert.ok(key,'Post Returned key');
    connector2.get().then(function(val){
      assert.ok(val.test,'Get got posted value');
      connector2.put({foo: true}).then(function(){
        connector2.get().then(function(val){
          assert.deepEqual(val, {foo: true}, 'Put alters value');
          assert.notOk(val.test,'Put overwrites whole value');
          connector2.patch({bar: true}).then(function(){
            connector2.get().then(function(val){
              assert.deepEqual(val, {foo: true, bar: true}, 'Patch Works');
              connector2.delete();
              connector2.get().then(function(val){
                assert.notOk(val,'Delete Works');
                done();
              });
            });
          });
        });
      });
    });
  });
});
QUnit.test( "fbConnector onChange listner test", function( assert ) {
  var done = assert.async();
  var called = 0;
  var connector = new fbConnector(baseURL);
  function callback(val){
    called++;
    assert.ok( val,'OnChange callback called');
    assert.notOk(called>1, 'Callback not called after cancel');
  }
  connector.onChange(callback);
  connector.put(true).then(function(){
    connector.offChange();
    connector.put(true);
    connector.delete();
    done();
  });
});
QUnit.test( "fbConnector onChildAdded listner test", function( assert ) {
  var done = assert.async();
  var called = 0;
  var connector = new fbConnector(baseURL);
  function callback(key, val){
    called++;
    assert.ok( val,'onChildAdded callback called');
    assert.notOk(called>1, 'Callback not called after cancel');
  }
  connector.onChildAdded(callback);
  connector.post(true).then(function(){
    connector.offChildAdded();
    connector.post(true);
    connector.delete();
    done();
  });
});
QUnit.test( "fbConnector onChildRemoved listner test", function( assert ) {
  var done = assert.async();
  var called = 0;
  var connector = new fbConnector(baseURL);
  function callback(key, val){
    called++;
    assert.ok( val,'onChildRemoved callback called');
    assert.notOk(called>1, 'Callback not called after cancel');
  }
  connector.onChildRemoved(callback);
  connector.post(true).then(function(key){
    var connector2 = new fbConnector(baseURL+'/'+key);
    connector2.delete().then(function(){
      connector.post(true).then(function(key){
        connector.offChildRemoved();
        var connector3 = new fbConnector(baseURL+'/'+key);
        connector3.delete().then(function(){
          connector.delete();
          done();
        });
      });
    });
  });
});
//testing index matchmaking
var matchMaking = new MatchMaking(fbConnector, baseURL);
var matchMaking2 = new MatchMaking(fbConnector, baseURL);
QUnit.test( "Create match test", function( assert ) {
  var done = assert.async();
  function listener (e) {
    assert.ok(true, 'Event dispatched');
    var connector = new fbConnector(baseURL+'/matches/'+e.detail.key);
    connector.get().then(function (match){
      assert.ok(match.creator === 'test_user', 'Match exists');
      removeEventListener('create_match', listener,false);
      connector.delete();
      done();
    });
  }
  addEventListener('create_match', listener, false);
 matchMaking.createMatch('test_user');
});

QUnit.test( "Join match test", function( assert ) {
  var done = assert.async();
  function listenerCreate (e) {
    removeEventListener('create_match', listenerCreate,false);
    matchMaking2.joinMatch(e.detail.key, 'test_user2');
  }
  function listenerJoin (e){
    assert.ok(true, 'Event dispatched');
    var connector = new fbConnector(baseURL+'/matches/'+e.detail.key);
    connector.get().then(function (match){
      var found = false;
      Object.keys(match.users).forEach(function(key,index) {
           if (match.users[key] === 'test_user2') found = true;
      });
      assert.ok(found, 'Added to user list');
      removeEventListener('change_match', listenerJoin, false);
      done();
    });
  }
  addEventListener('create_match', listenerCreate, false);
  addEventListener('change_match', listenerJoin, false);
  matchMaking.createMatch('test_user');
});
QUnit.test( "Start match test", function( assert ) {
  var done = assert.async();
  function listenerCreate (e) {
    removeEventListener('create_match', listenerCreate,false);
    matchMaking2.joinMatch(e.detail.key, 'test_user2');
  }
  function listenerJoin (e){
    removeEventListener('change_match', listenerJoin, false);
    matchMaking.startMatch();
  }
  var dispatched = 0;
  function listenerStart (e){
    assert.ok(true, 'Event Dispatched for: ' + e.detail.user);
    dispatched++;
    if(dispatched > 1){
      var connector = new fbConnector(baseURL+'/matches/'+e.detail.key);
      done();
    }
  }
  addEventListener('create_match', listenerCreate, false);
  addEventListener('change_match', listenerJoin, false);
  addEventListener('start_match', listenerStart, false);
  matchMaking.createMatch('test_user');
});
//wikiAPI tests
QUnit.test( "wikiAPI test getPage", function( assert ) {
  var done = assert.async();
  function callback(data){
    assert.ok(data.parse.title==='Foobar','Get Page Works');
    done();
  }
  wikiAPI.getPage('Foobar',callback);
});
QUnit.test( "wikiAPI test getExtract", function( assert ) {
  var done = assert.async();
  function callback(data){
    var found = false;
    Object.keys(data.query.pages).forEach(function(key,index) {
         if (data.query.pages[key].title ==='Foobar') found = true;
    });
    assert.ok(found, 'Get Extract Works');
    done();
  }
  wikiAPI.getExtract('Foobar',callback);
});
QUnit.test( "wikiAPI test getRandomArticleName", function( assert ) {
  var done = assert.async();
  function callback(data){
    assert.ok( typeof data=== 'string','Got Random Page: '+data);
    done();
  }
  wikiAPI.getRandomArticleName(callback);
});
