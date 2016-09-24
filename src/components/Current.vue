<style>
  html {
    overflow-y: scroll;
  }
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
    margin: 5px 0;
  }

  input.task-editor-input {
    border: 2px solid #fff;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.2);
    border-radius: 2px;
  }

  @media (min-width: 528px) {
    .form-inline2 .form-group {
      display: inline-block;
      margin-bottom: 0;
      vertical-align: middle;
    }
    .form-inline2 .form-control {
      display: inline-block;
      width: auto;
      vertical-align: middle;
    }
  }

</style>

<template>
  <div id="mainDiv" class="container-fluid">
    <edit-tags :show.sync="showEditTags"></edit-tags>
    <div v-show="error" id="error" class="alert alert-danger form-group">
      {{error}}
    </div>
    <div>
      <div class="current-page-heading row">
        <div class="col-sm-6 col-xs-6">
          <day-picker :day.sync="day"></day-picker>
          <button @click="previousDay" class="btn btn-default"><span class="glyphicon glyphicon-menu-left"></span></button>
          <button @click="nextDay" class="btn btn-default"><span class="glyphicon glyphicon-menu-right"></span></button>
          <button v-if="day != today" @click="goToToday" class="btn btn-default">Today</button>
        </div>
        <div class="col-sm-6 col-xs-6 text-right">
          <button v-if="editCancelable" @click="cancelEdit" class="btn btn-default">Cancel Edit</button>
          <button @click="toggleMode" class="btn btn-default">{{mode}}</button>
          <button @click="showEditTags = true" class="btn btn-default">Tags</button>
        </div>
      </div>
      <div class="panel-body row text-right" style="padding-top: 10px;">
        <form id="editForm" class="form-inline2" autocomplete="off" @submit.prevent>
          <div class="form-group">
            <auto id="name" :list="suggestedNames" :name.sync="edited.name" :text.sync="edited.text" class="form-control" placeholder="Task name">
            </auto>
          </div>
          <div class="form-group">
            <input id="units" v-model="edited.eUnits" type="number" min="0" step="any" class="form-control add-task" placeholder="Units" style="width: 60px;" />
          </div>
          <div id="parseButtonDiv" class="form-group text-right">
            <button type="button" id="parseButton" @click="parseTask()" class="btn btn-default" style="width: 40px;"><span class="glyphicon glyphicon-ok"></span></button>
          </div>
          <div class="form-group col-sm-12 col-md-12 col-xs-12" style="padding: 0;">
            <textarea class="form-control" v-model="edited.text"
                       style="width: 100%; z-index: -1" placeholder="More"></textarea>
          </div>
        </form>
      </div>
      <div v-if="sumPlan > 0">
        <table class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th class="col-sm-7"><small style="color: orange">Plan</small> Task name</th>
            <th class="col-sm-1">{{sumPlan}}</th>
            <th class="col-sm-2"></th>
          </tr>
          </thead>
          <tbody>
            <tr is="taskrow" v-for="task in tasksPlanedNotDone" :task="task"
                style="background-color: #FFF1C6;" mode="plan"></tr>
            <tr is="taskrow" v-for="task in tasksPlanedDone" :task="task" mode="plan"></tr>
          </tbody>
        </table>
      </div>
      <div v-if="sumDone > 0">
        <table class="table table-hover table-striped table-condensed">
          <thead>
          <tr>
            <th class="col-sm-7"><small style="color: orange">Done</small> Task name</th>
            <th class="col-sm-1">{{sumDone}}</th>
            <th class="col-sm-2"></th>
          </tr>
          </thead>
          <tbody>
          <tr is="taskrow" v-for="task in tasksPlanedDone" :task="task" mode="done"></tr>
          <tr is="taskrow" v-for="task in tasksDoneNotPlanned" :task="task" mode="done"
              style="background-color: lightgrey;"></tr>
          </tbody>
        </table>
      </div>
    </div>
    <button @click="showDebug = !showDebug">DEBUG</button>
    <div v-show="showDebug">
      <pre class="pre-scrollable">{{debug}}</pre>
    </div>
  </div>

</template>

<script>

  import StoreCollection from '../storeCollection';
  import DayPicker from './DayPicker.vue';
  import Auto from './Autocomplete.vue';
  import EditTags from './EditTags.vue';
  import TaskRow from './TaskRow.vue';
  import $ from 'jquery';
  var _ = require('lodash');
  import TagsParser from '../helpers/TagsParser.js';
  var store = new StoreCollection.Collection('tasks2');
  import FlatFormResizer from '../helpers/FlatFormResizer.js';

  var ffr = new FlatFormResizer.FlatFormResizer({
    mainInputId : 'name',
    mainInputOffset: 139,
    itemsSizes : {
      units: '60px',
      parseButtonDiv: '40px',
      parseButton: '40px'
    },
    afterResize : function() {
      var ulAutocomp = document.getElementById('ulAutocomplete');
      if (ulAutocomp) {
        ulAutocomp.style.width = document.getElementById('name').clientWidth + 'px';
      }
    }
  });
  var resizeTaskName = function() {
    ffr.resize();
  };

  var plan = 'plan',
      done = 'done';
  export default {
    name: 'Current',
    data: function() {
      return {
        edited: {
          name: '',
          text: '',
          eUnits: '',
        },
        showEditTags: false,
        editCancelable: false,
        message: 'Current!',
        suggestedNames: [],
        unique: {},
        error: false,
        tasks: [],
        day: '',
        mode: plan,
        today: today(),
        tagTypes: null,
        tagsParser: null,
        showDebug: false,
        debug: '{}',

      }
    },
    components: {
      'day-picker': DayPicker,
      'auto': Auto,
      'edit-tags': EditTags,
      'taskrow' : TaskRow
    },
    route: {
      data: function(to) {
        toggleTopNavActive('topNavLiCurrent');
        window.onresize = resizeTaskName;
        this.day = getParam('day', today());
        document.title = 'Current is current';
        setTimeout(resizeTaskName, 50);
        this.getTagsTypes();
      }
    },
    events: {
      'hook:created': function() {
        store.ensureIndexes({
          _id: '_design/index',
          views: {
            by_day: {
              map: function(doc) {
                emit(doc.day);
              }.toString()
            },
            sum_planned_by_name: {
              map: function(doc) {
                emit(doc.name, doc.units.plan);
              }.toString(),
              reduce: "_sum"
            },
            sum_done_by_name: {
              map: function(doc) {
                emit(doc.name, doc.units.done);
              }.toString(),
              reduce: function(keys, values, rereduce) {
                if (rereduce) {
                  console.log('rereduce', values);
                } else {
                  var vals = values.filter(function(x) {
                    return x ? true : false;
                  });
                  return sum(vals);
                }
              }.toString(),
            },
            emit_done_day: {
              map: function(doc) {
                emit(doc.name, doc.units.done);
              }.toString(),
            }
          }
        });
      },
      'hook:ready': function() {
        resizeTaskName();
      }
    },
    computed: {
      tasksDoneNotPlanned: function() {
        return _.filter(this.tasks, {
          plan: false,
          done: true
        });
      },
      tasksPlanedDone: function() {
        return _.filter(this.tasks, {
          plan: true,
          done: true
        });
      },
      tasksPlanedNotDone: function() {
        return _.filter(this.tasks, {
          plan: true,
          done: false
        });
      },
      sumPlan: function() {
        var sum = _.reduce(this.tasks, function(sum, item) {
          var units = item.plan ? parseFloat(item.units[plan]) : 0;
          return units + sum;
        }, 0);
        return sum.toFixed(1);
      },
      sumDone: function() {
        return _.reduce(this.tasks, function(sum, item) {
          var units = 0;
          if (item.done && item.units[done]) {
            units = parseFloat(item.units[done])
          }
          return units + sum;
        }, 0).toFixed(1);
      }
    },
    watch: {
      day: function(newVal) {
        this.refresh();
      },
      "edited.name": function(newVal) {
        var self = this;
        if (!newVal) {
          return;
        }
        if (newVal.substr(-1) === ' ') {
          self.searchFullWords(newVal);
        } else {
          store.allDocs({
            startkey: newVal,
            endkey: newVal + '\uffff',
            include_docs: true
          }).then(res => {
            self.parseSearchResponse(res, newVal);
          }).catch(err => {
            console.log('Error', err);
          });
        }
      },
      showEditTags: function(show) {
        if(!show) {
          this.getTagsTypes();
        }
      }
    },
    methods: {
      copyToNextDay: function(input) {
        var task = _.cloneDeep(input);
        var day = dayFrom(1, new Date(this.day));
        task._id = task.name + '_' + day;
        task.day = day;
        task.done = false;
        task.plan = true;
        task.units.plan = 1;
        delete task.units.done;
        delete task._rev;
        var self = this;
        store.put(task).then(function(res) {}).catch(function(err) {
          self.showError(err.message);
        });
      },
      nextDay: function() {
        this.day = dayFrom(1, new Date(this.day));
      },
      previousDay: function() {
        this.day = dayFrom(-1, new Date(this.day));
      },
      goToToday: function() {
        this.day = today();
      },
      searchFullWords: function(text) {
        var self = this;
        store.search(text, ['name']).then(function(res) {
          self.parseSearchResponse(res, text);
        }).catch(function(err) {
          console.log(err);
        });
      },
      parseSearchResponse: function(res, text) {
        this.suggestedNames = [];
        var unique = {};
        if (res.rows.length) {
          _.each(res.rows, function(item) {
            if (text !== item.doc.name) {
              unique[item.doc.name] = true;
            }
          });
          for (var name in unique) {
            this.suggestedNames.push({
              name: name,
              //tags: unique[name]
            });
          }
        }
      },
      taskDone: function(task) {
        task.done = true;
        task.units.done = task.units.plan;
        store.update(task);
        this.refresh();
      },
      moveToPlan: function(task) {
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
      parseTags: function(task) {
        if(!this.tagTypes) {
          this.showError('We need tag types to parse tags');
          return;
        }
        if(!this.tagsParser) {
          this.tagsParser = new TagsParser.TagsParser(this.tagTypes);
        }
        return this.tagsParser.parse(task.name + ' ' +task.text);
      },
      getTagsTypes: function() {
        var self = this;
        store.get(EditTags.documentId).then(res => {
          self.tagTypes = res.types;
        }).catch(err => {
            console.log('Error', err);
        });
      },
      edit: function(task, mode, inputId) {
        this.editCancelable = true;
        this.edited = _.clone(task);
        this.edited.eUnits = task.units[mode];
        this.edited.text = task.text;
        this.mode = mode;
        var input = el(inputId);
        if (input) {
          input.focus();
        }
      },
      cancelEdit: function() {
        this.edited = {
          name: '',
          text: '',
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
        this.cancelEdit();
        var self = this;
        this.tasks = [];
        store.query('index/by_day', {
          key: this.day,
          include_docs: true
        }).then(res => {
          var seenIds = {};
          $.each(res.rows, function(i, item) {
            if (item.doc && !seenIds[item.id]) {
              seenIds[item.id] = true;
              self.tasks.push(item.doc);
            }
          });
          self.debug = JSON.stringify(self.tasks, null, 2);
          //pp(self.tasks);
          //console.log(self.sumPlan, self.sumDone);
        }).catch(err => {
          console.log(err)
        })
      },
      parseTask: function() {
        this.editCancelable = false;
        var item = this.edited;
        if (item.name && item.eUnits) {
          var clon = this.prepClon(item);
          if (item._id) {
            this.updateTask(clon, item.eUnits)
          } else {
            this.createTask(clon, item.eUnits)
          }
          this.edited = {};
          this.refresh();
          el('name').focus();
        } else {
          console.error('We need name and units');
        }
      },
      prepClon: function(item) {
        item.tags =  this.parseTags(item);
        var clon = _.cloneDeep(item);
        delete clon.eUnits;
        return clon;
      },
      createTask: function(clon, units) {
        clon.units = {};
        clon.units[this.mode] = parseFloat(units);
        clon._id = clon.name + '_' + this.day;
        clon.day = this.day;
        clon.done = this.mode !== plan;
        clon.plan = !clon.done;
        var self = this;
        store.put(clon).then(function(res) {}).catch(function(err) {
          self.showError(err.message);
        });
      },
      updateTask: function(clon, units) {
        clon.units[this.mode] = parseFloat(units);
        store.upsert(clon).then(res => {
          console.log(res);        
        }).catch(err => {
            console.log('Error', err);
        });
      },
      showError: function(message) {
        this.error = message;
        console.log(message);
        var self = this;
        setTimeout(function() {
          console.log('timeout');
          self.error = false;
        }, 4000);
      }
    }
  }

</script>
