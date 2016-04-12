<link rel="stylesheet" type="text/css" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" >
<template>
    <div class="container-fluid">
        <div class="panel panel-default">
            <div class="panel-body">
                <div class="col-sm-6"><day-picker></day-picker></div>
                <div class="col-sm-6 text-right">
                    <button @click="toggleMode" class="btn btn-warning">{{mode}}</button>
                </div>
                <hr>
                <div class="text-right"><form class="form-inline" autocomplete="on" v-on:submit.prevent >
                    <div class="form-group">
                        <input style="min-width: 30em;" id="addTaskName" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name"
                               name="taskName"/>
                    </div>
                    <div class="form-group">
                        <input id="tags" v-model="edited.tags" type="text" class="form-control add-task" placeholder="Tags" width="100%"
                               name="taskCategory"/>
                    </div>
                    <div class="form-group">
                        <input id="units" v-model="edited.units[mode]" type="number" min="0" class="form-control add-task" placeholder="Units" style="max-width: 5em;"/>
                    </div>
                    <div class="form-group text-right">
                        <button @click="addTask()" class="btn btn-default"><span class="glyphicon glyphicon-ok"></span></button>
                    </div>
                </form>
                </div>

                <div v-for="(mode, list) in { Plan: plan, Execution: execution }">
                    <div v-if="list.length">
                        <table  class="table table-hover table-striped table-condensed">
                            <thead>
                            <tr>
                                <th class="col-sm-7"><small style="color: orange">{{mode}}</small> Task name</th>
                                <th class="col-sm-2 ">Tags</th>
                                <th v-if="mode == 'Plan'" class="col-sm-1"><b style="color: #0000ed">{{sumPlan}}</b></th>
                                <th v-else class="col-sm-1"><b tyle="color: #0000ed">{{sumExecution}}</b></th>
                                <th class="col-sm-2"></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="task in list">
                                <td @click="edit(task)">{{task.name}} <small style="color: red">{{task.mode}}</small></td>
                                <td @click="edit(task, 'tags')">{{task.tags.join(', ')}}</td>
                                <td @click="edit(task, 'units')">{{task.units[mode]}}</td>
                                <td class="text-right">
                                    <div class="btn-group">

                                        <button v-if="mode == 'Plan'" class="btn btn-info btn-xs" @click="copyToExecuted(task)">
                                            <span class="glyphicon glyphicon-download"></span>
                                        </button>
                                        <button v-else class="btn btn-info btn-xs" @click="moveToPlan(task)">
                                            <span class="glyphicon glyphicon-upload"></span>
                                        </button>
                                        <button class="btn btn-default btn-xs" @click="edit(task)"><span class="glyphicon glyphicon-edit"></span></button>
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

    var plan = 'plan', executed = 'executed';

    export default {
        name: 'Current',
        data: function() {
            return {
                message : 'Current!',
                edited : {
                    units : {
                        plan : 0,
                        execution : 0
                    }
                },
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
                return _.reduce(this.plan, function(sum, item) {
                    return parseInt(item.units[plan]) + sum;
                }, 0);
            },
            sumExecution: function() {
                return _.reduce(this.execution, function(sum, item) {
                    return parseInt(item.units[executed]) + sum;
                }, 0);
            }
        },
        watch : {
            day : function(newVal) {
                this.refresh();
            }
        },
        methods: {
            copyToExecuted: function(task) {
                var clon = _.clone(task);
                clon.done = true;
                store.add(clon);
                this.refresh();
            },
            moveToPlan : function(task) {
                task.done = false;
                store.put(task);
                this.refresh();
            },
            toggleMode: function() {
                this.mode = this.mode === 'execution' ? 'plan' : 'execution';
            },
            edit: function(task, inputId) {
                this.edited = task;
                inputId = inputId ? inputId : 'addTaskName';
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
                this.plan = [];
                this.execution = [];
                store.query('index/by_day', {
                    key: this.day,
                    include_docs : true
                }).then(res => {
                    _.each(res.rows, function(item) {
                        this.tasks.push(item.doc);
                    });
                }).catch(err => {console.log(err)})
            },
            addTask: function(e) {
                pp(this.edited);
                if(this.edited.name && this.edited.tags && this.edited.units) {
                    this.edited.tags = this.edited.tags.split(', ');
                    var clon = _.clone(this.edited);
                    clon.units = {};
                    clon.units[this.mode] = parseInt(this.edited.units[this.mode]);
                    if(this.edited._id) {
                        store.update(clon);
                    } else {
                        clon._id = _.snakeCase(this.day + '_' + clon.name);
                        clon.day = this.day;
                        clon.done = this.mode !== plan;
                        store.put(clon);
                    }
                    this.edited = {};
                    this.refresh();
                    el('addTaskName').focus();
                } else {
                    console.log('we need some data');
                }
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