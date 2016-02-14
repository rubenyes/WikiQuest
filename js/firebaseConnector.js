//Connector for firebase as a backend
function fbConnector (url){
  var self = new BasicConnector();
  var baseUrl = url;
  var fireRef = new Firebase(url);
  self.getURL = function () {return baseUrl};
  self.get = function (){
    var val= new Promise(function(resolve,reject){
        fireRef.once('value',function(data){
        var val = data.val();
        resolve(val);
      });
    });
    return val;
  };
  self.put = function (obj){ //replace
    return new Promise(function(resolve,reject){
      fireRef.set(obj, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  };
  self.post = function (obj){//create
    return new Promise(function(resolve,reject){
      var newRef = fireRef.push(obj, function(error) {
        if (error) {
          reject(error);
        }
      });
      resolve(newRef.key());
    });
  };
  self.patch = function (obj){
    return new Promise(function(resolve,reject){
      fireRef.update(obj, function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  };
  self.delete = function (){
    return new Promise(function(resolve,reject){
      fireRef.remove(function(error) {
        if (error) {
          reject(error);
        } else {
          resolve(true);
        }
      });
    });
  };
  self.onChange = function (callback){ //listner
    fireRef.on('value', function(dataSnapshot) {
      var val = dataSnapshot.val();
      callback(val);
    });
  };
  self.offChange = function (){ //turnOff listener
    fireRef.off('value');
  };
  self.onChildAdded = function (callback){
    fireRef.on('child_added', function(dataSnapshot) {
      var val = dataSnapshot.val();
      var key = dataSnapshot.key();
      callback(key, val);
    });
  };
  self.offChildAdded = function (){
    fireRef.off('child_added');
  };
  self.onChildRemoved = function (callback){
    fireRef.on('child_removed', function(dataSnapshot) {
      var val = dataSnapshot.val();
      var key = dataSnapshot.key();
      callback(key, val);
    });
  };
  self.offChildRemoved = function (){
    fireRef.off('child_removed');
  };

  return self;
}
