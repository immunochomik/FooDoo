
<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
       <day-picker :day.sync="start"></day-picker>
       <day-picker :day.sync="end"></day-picker>
      </div>
      <div class="col-sm-6">
        <button @click="doneSumary" class="btn btn-danger">Do</button>
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
        start: today(),
        end: this.day(-7),
        message: 'Summary!',
        doneByName: [],
      }
    },
    methods :{
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
      day : function(count) {
        var now = new Date()
        var result = d3.time.day.offset(now, count);
        console.log(result);
        return today();
      }
    },
    route: {
      data: function (to) {
        document.title = 'Summary';
      }
    },
    components: {
      'day-picker' : DayPicker,
    },
  }
</script>
<style>

</style>