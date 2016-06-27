<style>
</style>

<template>
  <div class="container-fluid">
    <div >
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
            <th @click="taskByNameSort('name')" style="width: 75%">Name</th>
            <th @click="taskByNameSort('plan')" class="text-right">Units
              <br>Planed</th>
            <th @click="taskByNameSort('done')" class="text-right">Units
              <br>Done</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row in byNameList">
            <td class="task-name {{makeTagClasses(row.tagClasses)}}">{{row.name}}</td>
            <td class="task-name text-right {{makeTagClasses(row.tagClasses)}}">{{row.plan}}</td>
            <td class="task-name text-right {{makeTagClasses(row.tagClasses)}}">{{row.done}}</td>
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
        <table @mouseleave="tagMouseLeave" class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th @click="taskByCatSort('name')" style="width: 75%">Tag</th>
            <th @click="taskByCatSort('plan')" class="text-right" >Units<br>Planed</th>
            <th @click="taskByCatSort('done')" class="text-right" >Units<br>Done</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="row in byTagList" >
            <td @mouseover=tagRowHover(row.name) >{{row.name}}</td>
            <td class="text-right">{{row.plan}}</td>
            <td class="text-right">{{row.done}}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>
    <div v-if="sumUnplanned > 0" id="unplannedTasks">
     <hr>
      <h3>Unplanned Work <span>{{unplannedProportion}}%</span></h3>
      <svg id="svgUnplannedWork" style="width:100%">
        <rect id="plannedRect" x="0" y="0" width="0" height="30" fill="green" stroke-width="1" stroke="rgb(221,221,221)"/>
        <rect id="unplannedRect" x="0" y="0" width="0" height="30" fill="#DF7D60" stroke-width="1" stroke="rgb(221,221,221)" />
      </svg>
    </div>
  </div>
</template>

<script>

  import Vue from 'vue';
  import StoreCollection from '../storeCollection';
  var store = new StoreCollection.Collection('tasks2');
  import DayPicker from './DayPicker.vue';
  var _ = require('lodash');
  var d3 = require('d3');

  var sortByDone = function(a, b) {
    if (a.done < b.done) return 1;
    if (a.done > b.done) return -1;
    return 0;
  };
  var sortByPlan = function(a, b) {
    if (a.plan < b.plan) return 1;
    if (a.plan > b.plan) return -1;
    return 0;
  };
  var sortByName = function(a, b) {
    if (a.name < b.name) return 1;
    if (a.name > b.name) return -1;
    return 0;
  };
  export default {
    data: function() {
      return {
        start: dayFrom(-7, new Date()),
        end: dayFrom(0, new Date()),
        message: 'Summary!',
        tasks: [],
        byNameList: [],
        byName: {},
        byTag: {},
        byTagList: [],
        byDay: {},
        sumPlan: 0,
        sumDone: 0,
        sumUnplanned: 0,
        unplannedProportion : 0,
      }
    },
    watch: {
      start: function() {
        this.refresh();
      },
      end: function() {
        this.refresh();
      }
    },
    methods: {
      makeTagClasses : function(obj) {
        return Object.keys(obj).join(' ');
      },
      tagRowHover: function(tag) {
        $('.task-name').css('background-color', '');
        $('.tag-'+tag).css('background-color', '#FFCF8B');
      },
      tagMouseLeave : function() {
        $('.task-name').css('background-color', '');
      },
      taskByNameSort: function(type) {
        if (type == 'name') {
          this.byNameList = this.byNameList.sort(sortByName)
        } else if(type == 'plan') {
          this.byNameList = this.byNameList.sort(sortByPlan)
        } else if(type == 'done') {
          this.byNameList = this.byNameList.sort(sortByDone)
        }
      },
      taskByCatSort: function(type) {
        if (type == 'name') {
          this.byTagList = this.byTagList.sort(sortByName)
        } else if(type == 'plan') {
          this.byTagList = this.byTagList.sort(sortByPlan)
        } else if(type == 'done') {
          this.byTagList = this.byTagList.sort(sortByDone)
        }
      },

      resetAll: function() {
        this.byName = {};
        this.byTag = {};
        this.byDay = {};
        this.tasks = [];
        this.sumPlan = this.sumDone = this.sumUnplanned = 0;
      },
      refresh: function() {
        var self = this;
        this.resetAll();
        store.query('index/by_day', {
          startkey: this.start,
          endkey: this.end,
          include_docs: true
        }).then(res => {
          var seenIds = {};
          _.each(res.rows, function(item) {
            if (!item.doc || seenIds[item.id]) return;
            seenIds[item.id] = true;
            self.tasks.push(item.doc);
            self.aggregateName(item.doc);
            self.aggregateTags(item.doc);
          });
          self.byTagList = Object.values(self.byTag).sort(sortByDone);
          self.byNameList = Object.values(self.byName).sort(sortByDone);
          self.prepareUnplannedWork();
        }).catch(err => {
          console.log(err)
        });
      },
      prepareUnplannedWork : function() {
        var proportion = this.sumUnplanned / this.sumDone;
        this.unplannedProportion = proportion.toFixed(3) * 100;
        var length = window.innerWidth - 10;
        var unpLength =  Math.ceil(length * proportion);
        var planLength = length - unpLength;
        console.log(length, unpLength, planLength);
        setTimeout(function() {
          d3.select('#plannedRect').attr('width', planLength);
          var unplannedRect = d3.select('#unplannedRect');
          unplannedRect.attr('width', unpLength)
              .attr('x', planLength);
        }, 200);


      },
      aggregateName: function(item) {
        var tagsClass = function(list) {
          var tags = {};
          _.each(_.map(list, function(it) {return 'tag-'+it}), function(it){
            tags[it] = true;
          });
          return tags;
        };
        if (!this.byName[item.name]) {
          this.byName[item.name] = {
            name: item.name,
            plan: item.units.plan || 0,
            done: item.units.done || 0,
            tagClasses : tagsClass(item.tags),
          }
        } else {
          this.byName[item.name].tagClasses = _.extend(this.byName[item.name].tagClasses, tagsClass(item.tags));
          this.byName[item.name].plan += item.units.plan || 0;
          this.byName[item.name].done += item.units.done || 0;
        }
        this.sumPlan += item.units.plan || 0;
        this.sumDone += item.units.done || 0;
        if(item.units.done > (item.units.plan || 0)) {
          this.sumUnplanned += (item.units.done - (item.units.plan || 0));
          console.log('unplande item add', item.name);
        }
      },
      aggregateTags: function(item) {
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
      doneSumary: function() {
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
      data: function(to) {
        toggleTopNavActive('topNavLiSummary');
        document.title = 'Summary';
        this.refresh();
      }
    },
    components: {
      'day-picker': DayPicker,
    },
  }

</script>
