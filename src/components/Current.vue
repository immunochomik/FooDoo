<link rel="stylesheet" type="text/css" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" >
<template>
  <div class="container-fluid">
    <div v-show="error" id="error" class="alert alert-danger form-group" >
      {{error}}
    </div>
    <div class="panel panel-default">
      <div class="panel-body">
        <div class="col-sm-3"><day-picker></day-picker></div>
        <div class="col-sm-8"></div>
        <div class="col-sm-1 text-right">
          <button @click="toggleMode" class="btn btn-warning">{{mode}}</button>
        </div>
        <hr>
        <div class="text-right">
          <form class="form-inline" autocomplete="on" v-on:submit.prevent >
            <div class="form-group">
              <input style="min-width: 30em;" id="name" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name"
                     name="taskName"/>
            </div>
            <div class="form-group">
              <input id="tags" v-model="edited.tags" type="text" class="form-control add-task" placeholder="Tags" width="100%"
                     name="taskCategory"/>
            </div>
            <div class="form-group">
              <input id="units" v-model="edited.eUnits" type="number" min="0" class="form-control add-task" placeholder="Units" style="max-width: 5em;"/>
            </div>
            <div class="form-group text-right">
              <button @click="parseTask()" class="btn btn-default"><span class="glyphicon glyphicon-ok"></span></button>
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
            <tr v-for="task in tasks" v-if="task.plan">
              <td @click="edit(task, 'plan', 'name')">{{task.name}}</td>
              <td @click="edit(task, 'plan', 'tags')">{{task.tags.join(', ')}}</td>
              <td @click="edit(task, 'plan', 'units')">{{task.units.plan}}</td>
              <td class="text-right">
                <div class="btn-group">
                  <button class="btn btn-info btn-xs" @click="taskDone(task)">
                    <span class="glyphicon glyphicon-download"></span>
                  </button>
                  <button class="btn btn-default btn-xs" @click="edit(task, 'plan')"><span class="glyphicon glyphicon-edit"></span></button>
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
            <tr v-for="task in tasks" v-if="task.done">
              <td @click="edit(task, 'done', 'name')">{{task.name}}</td>
              <td @click="edit(task, 'done', 'tags')">{{task.tags.join(', ')}}</td>
              <td @click="edit(task, 'done', 'units')">{{task.units.done}}</td>
              <td class="text-right">
                <div class="btn-group">
                  <button v-else class="btn btn-info btn-xs" @click="moveToPlan(task)">
                    <span class="glyphicon glyphicon-upload"></span>
                  </button>
                  <button class="btn btn-default btn-xs" @click="edit(task, 'done')"><span class="glyphicon glyphicon-edit"></span></button>
                  <button class="btn btn-danger  btn-xs" @click="remove(task)"><span class="glyphicon glyphicon-remove"></span></button>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>
<script>
  import store from '../store';
  import DayPicker from './DayPicker.vue';
  var _ = require('lodash');

  var plan = 'plan', done = 'done';

  export default {
    name: 'Current',
    data: function() {
      return {
        message : 'Current!',
        edited : {
          name : '',
          tags: '',
          eUnits: ''
        },
        error: false,
        tasks : [],
        day: today(),
        mode: plan,
      }
    },
    components: {
      'day-picker' : DayPicker
    },
    route: {
      data : function(to) {
        document.title = 'Current is current';
        this.$children[0].$data.starttime = this.$children[0].$data.starttime || this.day;
        this.refresh();
      }
    },
    computed: {
      sumPlan: function() {
        return _.reduce(this.tasks, function(sum, item) {
          var units = item.plan ? parseInt(item.units[plan]) : 0;
          return  units + sum;
        }, 0);
      },
      sumDone: function() {
        return _.reduce(this.tasks, function(sum, item) {
          var units = 0;
          if(item.done && item.units[done]) {
            units = parseInt(item.units[done])
          }
          return  units + sum;
        }, 0);
      }
    },
    watch : {
      day : function(newVal) {
        this.refresh();
      }
    },
    methods: {
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
        this.edited = _.clone(task);
        this.edited.eUnits = task.units[mode];
        this.edited.tags = task.tags.join(', ');
        this.mode = mode;
        el(inputId).focus();
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
          pp(self.tasks);
          console.log(self.sumPlan, self.sumDone);
        }).catch(err => {console.log(err)})
      },
      prepClon : function(item)  {
        item.tags = item.tags.split(', ');
        var clon = _.clone(item);
        delete clon.eUnits;
        return clon;
      },
      parseTask: function(e) {
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
        clon.units[this.mode] = parseInt(item.eUnits);
        clon._id = clon.name + '_' + today();
        clon.day = this.day;
        clon.done = this.mode !== plan;
        clon.plan = !clon.done;
        var self = this;
        store.put(clon).then(function(res) {
          console.log('Added');
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
        clon.units[this.mode] = parseInt(item.eUnits);
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
  red {
    color: red;
  }
  blue {
    color: blue;
  }
</style>