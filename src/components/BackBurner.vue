<style>
</style>

<template>
  <div id="mainDiv" class="container-fluid">
    <div v-show="error" class="alert alert-danger form-group">
      {{error}}
    </div>
    <div class="current-page-heading row">
      <div class="col-sm-3 col-xs-6">
        General To Do
      </div>
      <div class="col-sm-9 col-xs-6 text-right">
        <button v-if="editCancelable" @click="cancelEdit" class="btn btn-warning">Cancel Edit</button>
      </div>
    </div>
    <div class="panel-body row text-right" style="padding-top: 10px;">
      <form class="form-inline2" autocomplete="off" v-on:submit.prevent>
        <div class="form-group">
          <input id="name" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name" style="width: 160px;" />
        </div>
        <div class="form-group">
          <input id="tags" v-model="edited.tags" type="text" class="form-control add-task" placeholder="Tags" style="width: 160px;" />
        </div>
        <div class="form-group">
          <input id="units" v-model="edited.eUnits" type="number" min="0" step="any" class="form-control add-task" placeholder="Units" style="width: 60px;" />
        </div>
        <div class="form-group">
          <input id="priority" v-model="edited.priority" type="number" min="0" step="1" max="10" class="form-control add-task" placeholder="Priority" style="width: 60px;" />
        </div>
        <div id="parseButtonDivToDo" class="form-group text-right">
          <button id="parseButtonToDo" @click="parseTask()" class="btn btn-default" style="width: 40px;"><span class="glyphicon glyphicon-ok"></span></button>
        </div>
      </form>
    </div>
    <div v-if="tasks.length > 0">
      <table class="table table-hover table-striped table-condensed">
        <thead>
        <tr>
          <th class="col-sm-5" @click="sortBy('name')">Task name</th>
          <th class="col-sm-2" @click="sortBy('tags`')">Tags</th>
          <th class="col-sm-1" @click="sortBy('eUnits')">Units</th>
          <th class="col-sm-1" @click="sortBy('priority')">Prio</th>
          <th class="col-sm-2" @click="sortBy('eta')">ETA</th>
          <th class="col-sm-1"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="task in tasks">
          <td @click="edit(task, 'name')">{{task.name}}</td>
          <td @click="edit(task, 'tags')">{{task.tags.join(', ')}}</td>
          <td @click="edit(task, 'units')">{{task.eUnits}}</td>
          <td @click="edit(task, 'priority')">{{task.priority}}</td>
          <td>{{task.eta}}</td>
          <td>

            <button class="btn btn-danger btn-xs" @click="remove(task)"><span class="glyphicon glyphicon-remove"></span></button>
            <button v-if="!task.eta" class="btn btn-warning btn-xs" @click="plan(task)"><span class="glyphicon glyphicon-time"></span></button>

          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
  import StoreCollection from '../storeCollection';
  var todo = new StoreCollection.Collection('backBurner');
  var planedStore = new StoreCollection.Collection('tasks2');
  var _ = require('lodash');
  import $ from 'jquery';
  var moment = require('moment');
  import FlatFormResizer from '../helpers/FlatFormResizer.js';

  var ffr = new FlatFormResizer.FlatFormResizer({
    mainInputId : 'name',
    mainInputOffset: 367,
    itemsSizes : {
      tags: '160px',
      units: '60px',
      priority: '60px',
      parseButtonDivToDo: '40px',
      parseButtonToDo: '40px'
    }
  });
  var resizeForm = function() {
    ffr.resize();
  };

  var maxInDay = 8;

  export default {
    name: 'BackBurner',
    data: function() {
      return {
        edited: {
          name: '',
          tags: '',
          eUnits: ''
        },
        error: false,
        editCancelable: false,
        tasks: []
      }
    },
    route: {
      data: function(to) {
        toggleTopNavActive('topNavLiBackBurner');
        window.onresize = resizeForm;
        document.title = 'Back Burner';
        setTimeout(resizeForm, 50);
        this.refresh();
      }
    },
    events: {
      'hook:created': function() {
        console.log('created');
      },
      'hook:ready': function() {
        resizeForm();
      }
    },
    methods: {
      addEmptyDays: function(futurePlanedDays) {
        console.log(futurePlanedDays);
        // we need to plan in empty days that lay between planed days
        var pairs = _.toPairs(futurePlanedDays);
        $.each(pairs, function(i, pair) {
          if(pairs[i+1]) {
            var date1 = new Date(pair[0]);
            var date2 = new Date(pairs[i+1][0]);
            var diffDays = Math.ceil(Math.abs(date2.getTime() - date1.getTime()) / (1000 * 3600 * 24));
            if(diffDays > 1) {
              console.log(pair[0], pairs[i+1][0]);
              var period = daysPeriod(pair[0], pairs[i+1][0], 31).slice(1,-1);
              console.log(period);
              $.each(period, function(i, day) {
                futurePlanedDays[day] = 0;
              })
            }
          }
        });
        return sortObject(futurePlanedDays);
      },
      plan: function(task) {
        var currentDay = today();
        var futurePlanedDays = {};
        var self = this;
        planedStore.query('index/by_day', {
          startkey: currentDay,
          include_docs: true
        }).then(res => {
          _.each(res.rows, function(item) {
            if (item.doc) {
              if (!futurePlanedDays[item.doc.day]) {
                futurePlanedDays[item.doc.day] = item.doc.units.plan
              } else {
                futurePlanedDays[item.doc.day] += item.doc.units.plan;
              }
            }
          });
        }).then(res => {
          futurePlanedDays = self.addEmptyDays(futurePlanedDays);
          var sanity = 100,
              futurePlanedDaysDone = false,
              timeInDay = 0,
              usedTime = 0,
              unitsLeft = task.eUnits;
          while (true) {
            if (!futurePlanedDaysDone) {
              for (var day in futurePlanedDays) {
                timeInDay = maxInDay - futurePlanedDays[day];
                if (timeInDay > 0) {
                  usedTime = Math.min(timeInDay, unitsLeft);
                  self.planForDay(task, day, usedTime);
                  unitsLeft -= usedTime;
                  if(unitsLeft <= 0) {
                    self.onFinishedPlanning(task, day);
                    return;
                  }
                }
              }
              if(!_.isEmpty(futurePlanedDays)) {
                currentDay = dayFrom(1, new Date(day));
              }
              futurePlanedDaysDone = true;
            }
            usedTime = Math.min(maxInDay, unitsLeft);
            self.planForDay(task, currentDay, usedTime);
            unitsLeft -= usedTime;
            if(unitsLeft <= 0) {
              self.onFinishedPlanning(task, currentDay);
              return;
            }
            currentDay = dayFrom(1, new Date(currentDay));
            if (sanity-- < 0) {
              console.error('sanity break');
              break;
            }
          }
        })
        .catch(err => {
          console.error(err)
        })
      },
      onFinishedPlanning: function(task, day) {
        task.eta = day;
        todo.update(task);
        this.refresh();
      },
      planForDay: function(task, day, units) {
        var clon = {
          _id : task.name + '_' + day,
          name : task.name,
          tags: task.tags,
          units : {
            plan: units
          },
          done: false,
          plan: true,
          day: day,
        }
        planedStore.put(clon).then(res => {
          console.log(res);
        }).catch(err => {console.log(err)})
      },
      sortBy(field) {
    this.refresh(field);
  },
  refresh: function(field) {
    this.cancelEdit();
    var self = this;
    this.tasks = [];
    field = field || 'priority';
    todo.allSorted(this.tasks, function(it) {return it[field];});
  },
  edit: function(task, inputId) {
    this.editCancelable = true;
    this.edited = _.clone(task);
    this.edited.tags = task.tags.join(', ');
    var input = el(inputId);
    if (input) {
      input.focus();
    }
  },
  parseTask: function(e) {
    this.editCancelable = false;
    var item = this.edited;
    if (item.name && item.tags && item.eUnits) {
      var clon = this.prepClon(item);
      if (item._id) {
        pp(item);
        this.updateTask(clon, item)
      } else {
        this.createTask(clon, item)
      }
      this.edited = {};
      this.refresh();
      el('name').focus();
    } else {
      console.error('We need some data');
    }
  },
  prepClon: function(item) {
    item.tags = item.tags.split(', ');
    item.eUnits = parseFloat(item.eUnits);
    return _.clone(item);
  },
  createTask: function(clon) {
    clon._id = clon.name;
    clon.created = new Date().getTime();
    var self = this;
    todo.put(clon).then(function(res) {
      console.log(res);
    }).catch(function(err) {
      self.showError(err.message);
    });
  },
  updateTask: function(clon, item) {
    console.log('update');
    todo.update(clon);
  },
  cancelEdit: function() {
    this.edited = {
      name: '',
      tags: '',
      eUnits: '',
    };
    this.editCancelable = false;
  },
  remove: function(task) {
    todo.remove(task).then(res => {
      this.refresh();
    }).catch(err => {
      console.log('Error', err);
    });
  },
  }
  }

</script>
