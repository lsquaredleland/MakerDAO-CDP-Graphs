// https://github.com/nwoodthorpe/GraphQL-Vanilla-JS

GraphQL = (function(){
  function makeClient(endpoint){
    var requestHeaders = {};

    // Provide some sanitization for the client
    function sanitize(query_string){
      return query_string
        .replace(/[\n\r]*/g, "") // Remove newlines
        .replace(/"/g, "\\\""); // Escape double quotes so JSON is valid
    }

    function query(query_string, callback){
      var xhr = new XMLHttpRequest();
      xhr.open("POST", endpoint, true);

      for (var header in requestHeaders) {
        if(!requestHeaders.hasOwnProperty(header)) continue;
        xhr.setRequestHeader(header, requestHeaders[header]);
      }

      xhr.send("{\"query\": \"" + sanitize(query_string) + "\"}");
      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          callback(JSON.parse(xhr.responseText));
        }
      };
    }

    function setHeader(key, value){
      requestHeaders[key] = value;
    }

    function unsetHeader(key){
      delete requestHeaders[key];
    }

    return {
      "setHeader": setHeader,
      "unsetHeader": unsetHeader,
      "query": query
    };
  }

  return {
    "makeClient": makeClient
  };
})();
