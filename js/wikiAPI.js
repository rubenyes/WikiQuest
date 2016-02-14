//wikiAPI module IIFE
wikiAPI = (function createAPI(){
  var api={};
  api.getPage= function(page,callback){
    $.getJSON('http://en.wikipedia.org/w/api.php?action=parse&format=json&callback=?', {page:page, prop:'text|images', uselang:'en'}, callback);
  };
  api.getExtract= function(page,callback){
    $.getJSON('http://en.wikipedia.org/w/api.php?action=query&format=json&exintro&callback=?', {titles:page, prop:'extracts|pageimages', uselang:'en'}, callback);
  };
  api.getRandomArticleName = function(callback){
    $.getJSON("http://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&explaintext&exintro=&format=json&callback=?", function (data) {
      var pid;
      var ptitle;
      for (var prop in data.query.pages) {
        pid= prop;
        $.getJSON('http://en.wikipedia.org/w/api.php?action=query&prop=info&pageids='+pid+'&inprop=url&format=json&callback=?', function(url) {
          $.each(url.query.pages, function(key, page) {
            ptitle = page.title; // the url to the page
          });
          //Sincrony here
          callback(ptitle);
        });
        break;
      }
    });
  };
  return api;
})();
