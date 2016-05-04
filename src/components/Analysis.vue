<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-sm-6">
        <day-picker :day.sync="start"></day-picker>
        <day-picker :day.sync="end"></day-picker>
      </div>
    </div>
    <hr>
    <div class="row">
      <div class="col-sm-6">
        <p>Tasks By Name</p>
        <table class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th>Name</th>
            <th class="text-right">Units<br>Planed</th>
            <th class="text-right">Units<br>Done</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row in byNameList">
            <td>{{row.name}}</td>
            <td class="text-right">{{row.plan}}</td>
            <td class="text-right">{{row.done}}</td>
          </tr>
          <tr>
            <td></td>
            <td class="text-right">{{sumPlan}}</td>
            <td class="text-right">{{sumDone}}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <div class="col-sm-6">
        <p>Categories</p>
        <table class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th>Tag</th>
            <th class="text-right">Units<br>Planed</th>
            <th class="text-right">Units<br>Done</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row in byTagList">
            <td>{{row.name}}</td>
            <td class="text-right">{{row.plan}}</td>
            <td class="text-right">{{row.done}}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
  import Vue from 'vue';
  import store from '../store';
  import DayPicker from './DayPicker.vue';
  var _ = require('lodash');
  var d3 = require('d3');

  var sortByDone = function(a,b) {
    if(a.done < b.done) return 1;
    if(a.done > b.done) return -1;
    return 0;
  };
  export default {
    data: function () {
      return {
        start: dayFrom(-7, new Date()),
        end: dayFrom(0, new Date()),
        message: 'Summary!',
        tasks: [],
        byNameList : [],
        byName : {},
        byTag : {},
        byTagList : [],
        byDay : {},
        sumPlan : 0,
        sumDone : 0,
      }
    },
    watch : {
      start : function() {
        this.refresh();
      },
      end : function() {
        this.refresh();
      }
    },
    methods :{
      resetAll : function() {
        this.byName = {}; this.byTag = {}; this.byDay = {}; this.tasks = [];
        this.sumPlan = this.sumDone = 0;
      },
      refresh: function() {
        var self = this;
        this.resetAll();
        store.query('index/by_day', {
          startkey : this.start,
          endkey: this.end,
          include_docs : true
        }).then(res => {
          _.each(res.rows, function(item) {
            if(!item.doc) return;
            self.tasks.push(item.doc);
            self.aggregateName(item.doc);
            self.aggregateTags(item.doc);
          });
          self.byTagList = Object.values(self.byTag).sort(sortByDone);
          self.byNameList = Object.values(self.byName).sort(sortByDone);

        }).catch(err => {console.log(err)});
      },
      aggregateName : function(item) {
        if(!this.byName[item.name]) {
          this.byName[item.name] = {
            name : item.name,
            plan : item.units.plan || 0,
            done : item.units.done || 0
          }
        } else {
          this.byName[item.name].plan += item.units.plan || 0;
          this.byName[item.name].done += item.units.done || 0;
        }
        this.sumPlan += item.units.plan || 0;
        this.sumDone += item.units.done || 0;
      },
      aggregateTags : function(item) {
        var self = this;
        _.each(item.tags, function(tag) {
          if (!self.byTag[tag]) {
            self.byTag[tag] = {
              name: tag,
              plan: item.units.plan || 0,
              done: item.units.done || 0
            }
          } else {
            self.byTag[tag].plan += item.units.plan || 0;
            self.byTag[tag].done += item.units.done || 0;
          }
        });
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