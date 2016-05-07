var PouchDB = require('pouchdb');
PouchDB.plugin(require('pouchdb-quick-search'));
var _ = require('lodash');

var Collection = (function() {
  function Collection(name) {
    this.db = new PouchDB(name);
  }
  Collection.prototype.search = function(text, fields) {
    return this.db.search({
      query: text,
      fields: fields,
      include_docs: true
    });
  };
  Collection.prototype.put = function(doc) {
    return this.db.put(doc);
  };
  Collection.prototype.update = function(item) {
    if(!item._rev && item._id) {
      this.db.get(item._id).then(res => {
        item._rev = res._rev;
        this.db.put(item).then(res => {
          console.log('Update', res);
        }).catch(err => {
          console.log('U Error', err);
        });
      }).catch(err => {
        this.db.put(item);
      });
    } else {
      return this.db.put(item);
    }
  };
  Collection.prototype.get = function(id) {
    return this.db.get(id);
  };
  Collection.prototype.query = function(index, criteria) {
    return this.db.query(index, criteria);
  };

  Collection.prototype.allDocs = function(options) {
    return this.db.allDocs(options);
  };

  Collection.prototype.all = function() {
    return this.db.allDocs({
      include_docs:true
    });
  };

  Collection.prototype.remove = function(item) {
    return this.db.remove(item);
  };

  Collection.prototype.removeById = function(id) {
    db.get(id).then(doc => {
      return db.remove(doc);
    }).catch(err => {
      console.log('Error', err);
    });
  };
  Collection.prototype.init = function(ddoc) {
    var promiss = this.update(ddoc);
    if(promiss) {
      promiss.then(res => {
        console.log(res);
      }).catch(err => {
        console.log('Error', err);
      });
    }
  };
  return Collection;
})();


export default {
  Collection : Collection
}