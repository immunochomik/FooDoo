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
          <button class="btn btn-danger quoter">Delete</button>
        </div>
      </div>
      <div class="panel-body col-sm-6">
        <label>Update</label>
        <textarea v-model="update" class="form-control" placeholder="update"> </textarea>
      </div>
    </div>
    <div class="panel-body">
      <pre class="pre-scrollable" style="min-height: 30em;">{{ fullData }}</pre>
    </div>
    <div class="panel-body">
      <button @click="import" class="btn btn-default">Import</button>
      <button @click="import" class="btn btn-default">Export</button>
    </div>
  </div>
</template>
<script>
  import StoreCollection from '../storeCollection';
  import Vue from 'vue';
  var _ = require('lodash');
  var store = new StoreCollection.Collection('tasks2');

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

  export default {
    name: 'Data',
    data: function() {
      return {
        fullData : '',
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

        store.all().then(res => {
          this.fullData = JSON.stringify(this.filterFind(res.rows), null, 2);
        }).catch(err => {
          console.log('Error', err);
        });
        console.log('Refreshed');
      },
      destroy : function() {
        if(confirm('Destroy ?')) {
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
    }

  }
</script>

