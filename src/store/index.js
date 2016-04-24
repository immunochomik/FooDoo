var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-quick-search'));
var _ = require('lodash');
var db = new PouchDB('tasks2');

var remoteCouch = false;

var cache = {};

export default {

  search: function(text, fields) {
      return db.search({
        query: text,
        fields: fields,
        include_docs: true
      });
  },

  put : function(doc) {
    return db.put(doc);
  },

  add : function(item) {
    item._id = new Date().toISOString();
    delete item._rev;
    db.put(item).then(function (response) {

    }).catch(function(err) {
      console.log('Error', err);
    });
  },

  update : function(item) {
    if(!item._rev && item._id) {
      db.get(item._id).then(res => {
        console.log('get', res);
        item._rev = res._rev;
        db.put(item).then(res => {
            console.log('Update', res);
        }).catch(err => {
            console.log('U Error', err);
        });
      }).catch(err => {
          console.log('Error', err);
      });
    } else {
      return db.put(item)
    }
  },

  get : function(id) {
    return db.get(id);
  },

  query: function(index, criteria) {
    return db.query(index, criteria);
  },

  allDocs : function(options) {
    return db.allDocs(options);
  },

  all : function() {
    return db.allDocs({
      include_docs:true
    });
  },

  remove : function(item) {
    return db.remove(item);
  },

  removeById: function(id) {
    db.get(id).then(doc => {
        return db.remove(doc);
    }).catch(err => {
        console.log('Error', err);
    });
  },

  destroy : function() {
    db.destroy().then(function(res) {
      console.log('Done', res);
    }).catch(function(err) {
      console.log('Error', err);
    });
  }

}
