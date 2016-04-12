<link rel="stylesheet" type="text/css" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" >
<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-sm-1">
                <button @click="destroy" class="btn btn-danger">Destroy</button>
            </div>
            <div class="col-sm-1">
                <button @click="createIndexes" class="btn btn-danger">Indexes</button>
            </div>
            <div class="col-sm-1">
                <button @click="refresh" class="btn btn-danger">Refresh</button>
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
    var _ = require('lodash');

    function addIndexes() {
        var ddoc = {
            _id: '_design/index',
            views: {
                by_day: {
                    map: function (doc) { emit(doc.day); }.toString()
                }
            }
        };
        store.put(ddoc).then(function (res) {
            console.log(res);
        }).catch(function (err) {
            // some error (maybe a 409, because it already exists?)
            console.log(err);
        });
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
                console.log('dooo!');
                store.all().then(res => {
                    pp(res.rows)
                    _.each(res.rows, function(item) {
                    });
                }).catch(err => {
                    console.log('Error', err);
                });

            },
        }

    }
</script>
<style>

</style>