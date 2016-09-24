<style>
  .quoter {
    display: inline-block;
    width: 23.5%;
  }

</style>
<template>
  <div class="container-fluid">

    <div class="row" style="padding-left: 1em; padding-right: 1em">
      <div class="panel-body col-sm-6" >
        <label>Query</label>
        <textarea v-model="query" class="form-control" placeholder="were"> </textarea>
        <div style="margin-top: 1em;" class="text-center">
          <button class="btn btn-default quoter" @click="find">Find</button>
          <button class="btn btn-default quoter">Insert</button>
          <button class="btn btn-default quoter">Update</button>
          <button class="btn btn-danger quoter" @click="deleteItems">Delete</button>
        </div>
      </div>
      <div class="panel-body col-sm-6">
        <label>Update</label>
        <textarea v-model="update" class="form-control" placeholder="update"> </textarea>
      </div>
    </div>
    <div class="panel-body">
      <pre class="pre-scrollable" style="min-height: 30em;">{{ fullDataString }}</pre>
    </div>
    <div class="panel-body row">
      <div class="col-sm-6 col-md-6">
        <input class="form-control" type="file" id="files" name="files[]" multiple />
      </div>

      <div class="col-sm-6 col-md-6">
        <button @click="importItems" class="btn btn-default">Import</button>
        <button @click="export" class="btn btn-default">Export</button>
        <button @click="deleteAll" class="btn btn-danger">Delete All</button>
        <button @click="compact" class="btn btn-danger">Compact</button>
      </div>

    </div>
  </div>
</template>
<script>
  const dbName = 'tasks2';
  import StoreCollection from '../storeCollection';
  import Vue from 'vue';
  var _ = require('lodash');
  var store = new StoreCollection.Collection(dbName);


  function findInDoc(doc, key, expected, compare) {
    if(key.indexOf('.') == -1) {
      if(compare) {
        return compare(doc[key], expected)
      }
      return doc[key] == expected
    }
    var keyParts = key.split('.'),
        inDock = doc[keyParts.shift()];
    if(inDock === undefined) {
      return false;
    }
    return findInDoc(inDock, keyParts.join('.'), expected)
  }

  function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  export default {
    name: 'Data',
    data: function() {
      return {
        fullData : {},
        update: '{}',
        query: '{}',
      }
    },
    route: {
      data : function(to) {
        toggleTopNavActive('topNavLiData');
        this.refresh();
      }
    },
    methods : {
      compact : function() {
        store.compact();
      },
      deleteItems : function() {
        store.all().then(res => {
          var data = this.filterFind(res.rows);
          if(data) {
            console.log(data);
            data.forEach(function(item) {
              store.removeById(item.id);
            })
          }
        }).catch(err => {
          console.log(err);
        });
      },
      importItems: function() {
        var input = el('files');
        var reader = new FileReader();
        reader.onload =(function(theFile) {
          return function(e) {
            var data = JSON.parse(e.target.result);
            if(data) {
              data.forEach(function(item) {
                delete item.doc._rev;
                store.put(item.doc).then(res => {
                    console.log(res);
                }).catch(err => {
                    console.log('Error', err);
                });
              });
            }
          }
        })(input.files[0]);
        reader.readAsText(input.files[0]);
      },
      export : function() {
        download('export_{0}.json'.f([today()]), JSON.stringify(this.fullData));
      },
      find: function() {
        this.refresh();
      },
      filterFind : function(docs) {
        var query = JSON.parse(this.query);
        if(query) {
          docs = docs.filter(function(row) {
            for(var key in query) {
              if(!findInDoc(row, key, query[key])) {
                return false;
              }
            }
            return true;
          });
          console.log(query);
        }
        return docs;
      },
      refresh : function() {
        console.log(store);
        store.all().then(res => {
          this.fullData = this.filterFind(res.rows);
        }).catch(err => {
          if(err.message === 'database is destroyed') {
            store = new StoreCollection.Collection(dbName);
            store.all().then(res => {
              this.fullData = this.filterFind(res.rows);
            })
          } else {
            console.log(err);
          }
        });
        console.log('Refreshed');
      },
      deleteAll : function() {
        if(confirm('Destroy ?')) {
          download('snapshot_{0}.json'.f([today()]), JSON.stringify(this.fullData));
          console.log('Destroy');
          store.destroy();
          this.refresh();
        }
      },
      createIndexes: function () {
        store.addIndexes();
        this.refresh();
      },
      doStuff: function() {
        //return;
        Vue.util.warn('Hello');
      }
    },
    computed : {
      fullDataString: function() {
        return JSON.stringify(this.fullData, null, 2);
      }
    }

  }
</script>

