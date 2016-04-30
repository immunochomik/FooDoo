<template>
  <div id="mainDiv" class="container-fluid">
    <div v-show="error" id="error" class="alert alert-danger form-group" >
      {{error}}
    </div>
    <div>
      <div class="current-page-heading row">
        <div class="col-sm-3 col-xs-6">
          <day-picker :day.sync="day"></day-picker>
        </div>
        <div class="col-sm-9 col-xs-6 text-right">
          <button v-if="editCancelable" @click="cancelEdit" class="btn btn-warning">Cancel Edit</button>
          <button @click="toggleMode" class="btn btn-warning">{{mode}}</button>
        </div>
      </div>
      <div class="panel-body row text-right" style="padding-top: 10px;">
        <form id="editForm" class="form-inline" autocomplete="off" v-on:submit.prevent >
          <div class="form-group">
            <auto
                id="name"
                :list="suggestedNames"
                :text.sync="edited.name"
                :tags.sync="edited.tags"
                class="form-control"
                placeholder="Task name">
            </auto>
          </div>
          <div class="form-group">
            <input id="tags" v-model="edited.tags" type="text" class="form-control add-task" placeholder="Tags" style="width: 160px;"/>
          </div>
          <div class="form-group">
            <input id="units" v-model="edited.eUnits" type="number" min="0" step="any" class="form-control add-task" placeholder="Units" style="width: 60px;"/>
          </div>
          <div class="form-group text-right">
            <button id="parseButton" @click="parseTask()" class="btn btn-default" style="width: 40px;"><span class="glyphicon glyphicon-ok" ></span></button>
          </div>
        </form>
      </div>
      <div v-if="sumPlan > 0">
        <table  class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th class="col-sm-7"><small style="color: orange">Plan</small> Task name</th>
            <th class="col-sm-2 ">Tags</th>
            <th class="col-sm-1">{{sumPlan}}</th>
            <th class="col-sm-2"></th>
          </tr>
          </thead>
          <tbody>
          <tr style="background-color: #FFF1C6;" v-for="task in tasksPlanedNotDone">
            <td @click="edit(task, 'plan', 'name')">{{task.name}}</td>
            <td @click="edit(task, 'plan', 'tags')">{{task.tags.join(', ')}}</td>
            <td @click="edit(task, 'plan', 'units')">{{task.units.plan}}</td>
            <td class="text-right">
              <div class="btn-group">
                <button class="btn btn-info btn-xs" @click="taskDone(task)">
                  <span class="glyphicon glyphicon-download"></span>
                </button>
                <button class="btn btn-danger  btn-xs" @click="remove(task)"><span class="glyphicon glyphicon-remove"></span></button>
              </div>
            </td>
          </tr>
          <tr v-for="task in tasksPlanedDone">
            <td @click="edit(task, 'plan', 'name')">{{task.name}}</td>
            <td @click="edit(task, 'plan', 'tags')">{{task.tags.join(', ')}}</td>
            <td @click="edit(task, 'plan', 'units')">{{task.units.plan}}</td>
            <td class="text-right">
              <div class="btn-group">
                <button class="btn btn-info btn-xs" @click="taskDone(task)">
                  <span class="glyphicon glyphicon-download"></span>
                </button>
                <button class="btn btn-danger  btn-xs" @click="remove(task)"><span class="glyphicon glyphicon-remove"></span></button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
      <div v-if="sumDone > 0">
        <table  class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th class="col-sm-7"><small style="color: orange">Done</small> Task name</th>
            <th class="col-sm-2 ">Tags</th>
            <th class="col-sm-1">{{sumDone}}</th>
            <th class="col-sm-2"></th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="task in tasksDone" >
            <td @click="edit(task, 'done', 'name')">{{task.name}}</td>
            <td @click="edit(task, 'done', 'tags')">{{task.tags.join(', ')}}</td>
            <td @click="edit(task, 'done', 'units')">{{task.units.done}}</td>
            <td class="text-right">
              <div class="btn-group">
                <button v-else class="btn btn-info btn-xs" @click="moveToPlan(task)">
                  <span class="glyphicon glyphicon-upload"></span>
                </button>
                <button class="btn btn-danger  btn-xs" @click="remove(task)"><span class="glyphicon glyphicon-remove"></span></button>
              </div>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
  import store from '../store';
  import DayPicker from './DayPicker.vue';
  import Auto from './Autocomplete.vue';
  import $ from 'jquery';
  var _ = require('lodash');

  var resizeTaskName = function() {
    var field = el('name');
    if(field) {
      var length = window.innerWidth -100;
      if(window.innerWidth > 767) {
        length = window.innerWidth - 302;
      }
      field.style.width = '{0}px'.f([length]);
    }
  };

  window.onresize = resizeTaskName;
  var plan = 'plan', done = 'done';

  export default {
    name: 'Current',
    data: function() {
      return {
        edited : {
            name : '',
            tags: '',
            eUnits: '',
            },
        editCancelable : false,
        message : 'Current!',
        suggestedNames: [],
        unique : {},
        error: false,
        tasks : [],
        day: today(),
        mode: plan,
      }
    },
    components: {
      'day-picker' : DayPicker,
      'auto' : Auto,
    },
    route: {
      data : function(to) {
        store.get('_design/index').then(res => {
          //if there than do nothind
        }).catch(err => {
          console.log('Error', err);
        });
        document.title = 'Current is current';
        this.$children[0].$data.starttime = this.$children[0].$data.starttime || this.day;
        this.refresh();
      }
    },
    events : {
      'hook:created' : function() {
        console.log('created');
      },
      'hook:ready': function() {
        resizeTaskName();
      }
    },
    computed: {
      tasksDone : function() {
        return _.filter(this.tasks, {done: true});
      },
      tasksPlanedDone : function() {
        return _.filter(this.tasks, {plan:true, done:true});
      },
      tasksPlanedNotDone : function() {
        return _.filter(this.tasks, {plan:true, done:false});
      },
      sumPlan: function() {
        return _.reduce(this.tasks, function(sum, item) {
          var units = item.plan ? parseFloat(item.units[plan]) : 0;
          return  units + sum;
        }, 0);
      },
      sumDone: function() {
        return _.reduce(this.tasks, function(sum, item) {
          var units = 0;
          if(item.done && item.units[done]) {
            units = parseFloat(item.units[done])
          }
          return  units + sum;
        }, 0);
      }
    },
    watch : {
      day : function(newVal) {
        this.refresh();
      },
      "edited.name" : function(newVal) {
        var self = this;
        if(!newVal) {
          return;
        }
        if(newVal.substr(-1) === ' ') {
          self.searchFullWords(newVal);
        } else {
          store.allDocs({
            startkey : newVal,
            endkey: newVal + '\uffff',
            include_docs:true
          }).then(res => {
            self.parseSearchResponse(res, newVal);
          }).catch(err => {
            console.log('Error', err);
          });
        }
      }
    },
    methods: {
      searchFullWords : function(text) {
        var self = this;
        store.search(text, ['name']).then(function(res) {
          self.parseSearchResponse(res, text);
        }).catch(function(err) {
          console.log(err);
        });
      },
      parseSearchResponse : function (res, text) {
        this.suggestedNames = [];
        var unique = {};
        if(res.rows.length) {
          _.each(res.rows, function(item) {
            if(text !== item.doc.name) {
              unique[item.doc.name] = item.doc.tags;
            }
          });
          for(var name in unique) {
            this.suggestedNames.push({name : name, tags : unique[name]});
          }
        }
      },
      taskDone: function(task) {
        task.done = true;
        task.units.done = task.units.plan;
        store.update(task);
        this.refresh();
      },
      moveToPlan : function(task) {
        task.done = false;
        task.plan = true;
        task.units.plan = task.units.done;
        delete task.units.done;
        store.update(task);
        this.refresh();
      },
      toggleMode: function() {
        this.mode = this.mode === done ? plan : done;
      },
      edit: function(task, mode, inputId) {
        this.editCancelable = true;
        this.edited = _.clone(task);
        this.edited.eUnits = task.units[mode];
        this.edited.tags = task.tags.join(', ');
        this.mode = mode;
        var input = el(inputId);
        if(input) {
          input.focus();
        }

      },
      cancelEdit : function() {
        this.edited = {
          name: '',
          tags: '',
          eUnits: '',
        };
        this.editCancelable = false;
      },
      remove: function(task) {
        store.remove(task).then(res => {
          this.refresh();
        }).catch(err => {
          console.log('Error', err);
        });
      },
      refresh: function() {
        var self = this;
        this.tasks = [];
        store.query('index/by_day', {
          key: this.day,
          include_docs : true
        }).then(res => {
          _.each(res.rows, function(item) {
            self.tasks.push(item.doc);
          });
          //pp(self.tasks);
          //console.log(self.sumPlan, self.sumDone);
        }).catch(err => {console.log(err)})
      },
      prepClon : function(item)  {
        item.tags = item.tags.split(', ');
        var clon = _.clone(item);
        delete clon.eUnits;
        return clon;
      },
      parseTask: function(e) {
        this.editCancelable = false;
        var item = this.edited;
        if(item.name && item.tags && item.eUnits) {
          var clon = this.prepClon(item);
          if(item._id) {
            this.updateTask(clon, item)
          } else {
            this.createTask(clon, item)
          }
          this.edited = {};
          this.refresh();
          el('name').focus();
        } else {
          console.log('we need some data');
        }
      },
      createTask : function(clon, item) {
        clon.units = {};
        clon.units[this.mode] = parseFloat(item.eUnits);
        clon._id = clon.name + '_' + this.day;
        clon.day = this.day;
        clon.done = this.mode !== plan;
        clon.plan = !clon.done;
        var self = this;
        store.put(clon).then(function(res) {
        }).catch(function(err) {
          self.showError(err.message);
        });
      },
      showError : function(message) {
        this.error = message;
        console.log(message);
        var self = this;
        setTimeout(function() {
          console.log('timeout');
          self.error = false;
        }, 4000);
      },
      updateTask : function(clon, item) {
        console.log('update');
        clon.units[this.mode] = parseFloat(item.eUnits);
        store.update(clon);
      }
    }
  }
</script>
<style>
  div.form-group {
    margin-top: 0.5em;
  }
  div.add-task {
    padding: 4px;
  }
  input.add-task {
    padding: 2px;
  }
  div.current-page-heading {
    padding-top: 1em;
  }
  hr.just-line {
    margin : 5px 0;
  }
</style>