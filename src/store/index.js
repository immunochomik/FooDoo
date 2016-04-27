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
        db.put(item);
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
  },

  addIndexes : function() {
    var ddoc = {
      _id: '_design/index',
      views: {
        by_day: {
          map: function (doc) { emit(doc.day); }.toString()
        },
        sum_planned_by_name : {
          map: function (doc) { emit(doc.name, doc.units.plan); }.toString(),
          reduce : "_sum"
        },
        sum_done_by_name : {
          map: function (doc) { emit(doc.name, doc.units.done); }.toString(),
          reduce : function(keys, values, rereduce) {
            if (rereduce) {
              console.log('reredue', values);
            } else {
              var vals = values.filter(function (x) {
                return x ? true : false;
              });
              console.log(vals);
              return sum(vals);
            }
          }.toString(),
        },
        emit_done_day: {
          map: function (doc) { emit(doc.name, doc.units.done); }.toString(),
        }
      }
    };
    var promiss = this.update(ddoc);
    if(promiss) {
      promiss.then(res => {
        console.log(res);
      }).catch(err => {
        console.log('Error', err);
      });
    }
  }
}
