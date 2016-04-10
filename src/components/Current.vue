<link rel="stylesheet" type="text/css" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" >
<template>
    <div class="container-fluid">
        <div class="panel panel-default">
            <div class="panel-body">
                <div class="col-sm-6"><day-picker></day-picker></div>
                <div class="col-sm-6 text-right">
                    <button @click="toggleMode" class="btn btn-warning">{{mode}}</button>
                    <button @click="doStuff" class="btn btn-danger">Doo Stuff</button>
                </div>
                <hr>
                <div class="text-right"><form class="form-inline" autocomplete="on" v-on:submit.prevent >
                    <div class="form-group">
                        <input style="min-width: 30em;" id="addTaskName" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name"
                               name="taskName"/>
                    </div>
                    <div class="form-group">
                        <input id="category" v-model="edited.category" type="text" class="form-control add-task" placeholder="Category" width="100%"
                               name="taskCategory"/>
                    </div>
                    <div class="form-group">
                        <input id="subcategory" v-model="edited.subcategory" type="text" class="form-control add-task" placeholder="Subcategory" />
                    </div>
                    <div class="form-group">
                        <input id="units" v-model="edited.units" type="number" min="0" class="form-control add-task" placeholder="Units" style="max-width: 5em;"/>
                    </div>
                    <div class="form-group text-right">
                        <button @click="addTask()" class="btn btn-default"><span class="glyphicon glyphicon-ok"></span></button>
                    </div>
                </form>
                </div>

                <div v-for="(mode, list) in { Plan: plan, Execution: execution }">
                    <hr>
                    <h4>{{ mode }}</h4>
                    <div v-if="list.length">
                        <table  class="table table-hover table-striped table-condensed">
                            <thead>
                            <tr>
                                <th class="col-sm-7">Task name</th>
                                <th class="col-sm-1">Category</th>
                                <th class="col-sm-1">Subcat</th>
                                <th class="col-sm-1">Units</th>
                                <th class="col-sm-2"></th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr v-for="task in list">
                                <td @click="edit(task)">{{task.name}} <small style="color: red">{{task.mode}}</small></td>
                                <td @click="edit(task, 'category')">{{task.category}}</td>
                                <td @click="edit(task, 'subcategory')">{{task.subcategory}}</td>
                                <td @click="edit(task, 'units')">{{task.units}}</td>
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
                            <tfoot class="panel-footer table-bordered">
                                <tr>
                                    <td colspan="3"></td>
                                    <td v-if="mode == 'Plan'">{{sumPlan}}</td>
                                    <td v-else>{{sumExecution}}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import store from '../store';
    import DayPicker from './DayPicker.vue'
    var _ = require('lodash');

    function addIndexes() {
        var ddoc = {
            _id: '_design/index',
            views: {
                by_day: {
                    map: function (doc) { emit(doc.day); }.toString()
                }
            }
        };
        store.put(ddoc).then(function (res) {
            console.log(res);
        }).catch(function (err) {
            // some error (maybe a 409, because it already exists?)
            console.log(err);
        });
    }

    export default {
        name: 'Current',
        data: function() {
            return {
                message :'Current!',
                edited : {},
                plan : [],
                execution : [],
                day: today(),
                mode: 'Plan',
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
                    return parseInt(item.units) + sum;
                }, 0);
            },
            sumExecution: function() {
                return _.reduce(this.execution, function(sum, item) {
                    return parseInt(item.units) + sum;
                }, 0);
            }
        },
        watch : {
            day : function(newVal) {
                this.refresh();
            }
        },
        methods: {
            doStuff: function() {
                //return;
                console.log('dooo!');
                store.all().then(res => {
                    pp(res.rows)
                    _.each(res.rows, function(item) {
                    });
                }).catch(err => {
                    console.log('Error', err);
                });

            },
            copyToExecuted: function(task) {
                var clon = _.clone(task);
                clon.mode = 'Execution';
                store.add(clon);
                this.refresh();
            },
            moveToPlan : function(task) {
                task.mode = 'Plan';
                store.put(task);
                this.refresh();
            },
            toggleMode: function() {
                this.mode = this.mode === 'Execution' ? 'Plan' : 'Execution';
            },
            edit: function(task, inputId) {
                console.log();
                this.edited = task;
                inputId = inputId ? inputId : 'addTaskName';
                el(inputId).focus();
            },
            remove: function(task) {
                console.log(task);
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
                        if(item.doc.mode === 'Plan') {
                            self.plan.push(item.doc);
                        } else if (item.doc.mode === 'Execution') {
                            self.execution.push(item.doc);
                        }
                    });
                }).catch(err => {console.log(err)})
            },
            addTask: function(e) {
                if(this.edited.name && this.edited.category && this.edited.units) {
                    this.edited.units = parseInt(this.edited.units);
                    var clon = _.clone(this.edited);
                    if(this.edited._id) {
                        store.update(clon);
                    } else {
                        clon.day = this.day;
                        clon.mode = this.mode;
                        store.add(clon);
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

</style>