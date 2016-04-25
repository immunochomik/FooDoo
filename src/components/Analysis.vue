<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
       <day-picker :day.sync="start"></day-picker>
       <day-picker :day.sync="end"></day-picker>
      </div>
      <div class="col-sm-6">
        <button @click="refresh" class="btn btn-danger">Do</button>
      </div>
    </div>
    <hr>
    <p>Tasks Done By Name</p>
    <table class="table table-hover table-striped table-condensed">
      <thead>
        <tr>
          <th>Name</th>
          <th>Units</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in doneByName">
          <td>{{row.key}}</td>
          <td>{{row.value}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
  import store from '../store';
  import DayPicker from './DayPicker.vue';
  var _ = require('lodash');
  var d3 = require('d3');
  export default {
    data: function () {
      return {
        start: dayFrom(-7, new Date()),
        end: dayFrom(0, new Date()),
        message: 'Summary!',
        task: [],
      }
    },
    methods :{
      refresh: function() {
        var self = this;
        this.tasks = [],
        store.query('index/by_day', {
          startkey : this.start,
          endkey: this.end,
          include_docs : true
        }).then(res => {
          console.log(res);
          _.each(res.rows, function(item) {
            self.tasks.push(item);
          });
          console.log(self.tasks);
        }).catch(err => {console.log(err)})
      },
      doneSumary : function() {
        this.doneByName = [];
        store.query('index/sum_done_by_name', {
          group: true,
        }).then(res => {
          this.doneByName = res.rows;
        }).catch(err => {
            console.log('Error', err);
        });
      },

    },
    route: {
      data: function (to) {
        document.title = 'Summary';
        this.refresh();
      }
    },
    components: {
      'day-picker' : DayPicker,
    },
  }
</script>
<style>

</style>