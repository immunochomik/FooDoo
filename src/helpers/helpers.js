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

function printIt(x) {
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
}

export default {
  pp : function(){
    for(var i in arguments) {
      printIt(arguments[i]);
    }
  },

  el : function (id) {
    return document.getElementById(id);
  },

  today : function(day) {
    day = day ? day : new Date();
    var dd = day.getDate();
    var mm = day.getMonth()+1; //January is 0!
    var yyyy = day.getFullYear();
    if(dd < 10) {
      dd = '0' + dd
    }
    if(mm < 10) {
      mm = '0' + mm
    }
    return yyyy +'-' + mm + '-' + dd;
  }
}