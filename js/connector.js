//base module for connection to backend
function BasicConnector (){
  this.get = function (){
    throw "Get not implmented";
  };
  this.put = function (obj){ //replace
    throw "Put not implmented";
  };
  this.post = function (obj){//create
    throw "Post not implmented";
  };
  this.patch = function (obj){
    throw "Patch not implemented";
  };
  this.delete = function (){
    throw "Delete not implmented";
  };
  this.onChange = function (callback){ //listner
    throw "onChange not implmented";
  };
  this.offChange = function (){ //turnOff listener
    throw "onChange not implmented";
  };
  this.onChildAdded = function (callback){
    throw "onChildAdded not implmented";
  };
  this.offChildAdded = function (){
    throw "offChildAdded not implmented";
  };
}
