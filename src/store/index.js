var PouchDB = require('pouchdb');
var _ = require('lodash');
var db = new PouchDB('tasks');

var remoteCouch = false;

let cache = {};

export default {

  add : function(item) {
    item._id = new Date().toISOString();
    db.put(item).then(function (response) {

    }).catch(function(err) {
      console.log('Error', err);
    });
  },

  update : function(item) {
    return db.put(item);
  },

  get : function(id) {
    return db.get(id);
  },

  all : function() {
    return db.allDocs({
      include_docs:true
    });
  },

  remove : function(item) {
    return db.remove(item);
  },

  destroy : function() {
    db.destroy().then(function(res) {
      console.log('Done', res);
    }).catch(function(err) {
      console.log('Error', err);
    });
  }

}
