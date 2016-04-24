<template>
    <div class="container-fluid">
        <div class="row">
            <div v-if="false" class="col-sm-1">
                <button @click="destroy" class="btn btn-danger">Destroy</button>
            </div>
            <div class="col-sm-1">
                <button @click="createIndexes" class="btn btn-danger">Indexes</button>
            </div>
            <div class="col-sm-1">
                <button @click="refresh" class="btn btn-danger">Refresh</button>
            </div>
            <div class="col-sm-1">
              <button @click="doStuff" class="btn btn-danger">Do stuff</button>
            </div>
        </div>
        <hr>
        <div class="panel panel-default">
            <div class="panel-body">
                <pre>{{ rows }}</pre>
            </div>
        </div>
    </div>

</template>
<script>
    import store from '../store';
    import Vue from 'vue';
    var _ = require('lodash');

    function addIndexes() {
        //store.remove({
        //  _id: '_design/index',
        //  _rev: "1-1d4b9f4ead4a4e60b5f0b1f8b1515ed8"
        //}).then(res => {
        //    console.log(res);
        //}).catch(err => {
        //    console.log('Error', err);
        //});
      //return;
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
        var promiss = store.update(ddoc);
        if(promiss) {
          promiss.then(res => {
            console.log(res);
          }).catch(err => {
            console.log('Error', err);
          });
        }
    }
    
    export default {
        name: 'Data',
        data: function() {
            return {
                rows : '',
            }
        },
        route: {
            data : function(to) {
                this.refresh();
            }
        },
        methods : {
            refresh : function() {
                store.all().then(res => {
                    this.rows = JSON.stringify(res.rows, null, 2);
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
                addIndexes();
                this.refresh();
            },
            doStuff: function() {
                //return;
              Vue.util.warn('Hello');
            },
        }

    }
</script>
<style>

</style>