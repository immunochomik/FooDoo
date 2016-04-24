
<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
       <day-picker :day.sync="start"></day-picker>
       <day-picker :day.sync="end"></day-picker>
      </div>
      <div class="col-sm-6">
        {{start}} {{end}}
      </div>
    </div>
    <hr>
    <pre>{{ data }}</pre>
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
        message: 'Summary!'
      }
    },
    methods :{
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