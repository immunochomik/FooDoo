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
  }
}