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
    var _ = require('lodash')
    
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
<style>

</style>