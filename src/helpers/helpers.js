String.prototype.format = String.prototype.f =  function() {
  var args;
  args = arguments;
  if (args.length === 1 && args[0] !== null && typeof args[0] === 'object') {
    args = args[0];
  }
  return this.replace(/{([^}]*)}/g, function(match, key) {
    return (typeof args[key] !== "undefined" ? args[key] : match);
  });
};


export default {
 pp : function(x){
    var cache = [];
    x = JSON.stringify(x, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    }, 2);
    cache = null; // Enable garbage collection
    console.log(x);
  },

  el : function (id) {
    return document.getElementById(id);
  },

  today : function() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    if(dd < 10) {
      dd = '0' + dd
    }
    if(mm < 10) {
      mm = '0' + mm
    }
    return yyyy +'-' + mm + '-' + dd;
  }
}