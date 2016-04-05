<template>
        <!-->
        <link rel="stylesheet" type="text/css" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" >
        -->
    <div class="container-fluid">
        <div class="panel panel-default">
            <div class="panel-body">

                    <div class="text-right"><form class="form-inline">
                        <div class="form-group">
                            <input style="min-width: 30em;" id="addTaskName" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name"/>
                        </div>
                        <div class="form-group">
                            <input v-model="edited.category" type="text" class="form-control add-task" placeholder="Category" width="100%" />
                        </div>
                        <div class="form-group">
                            <input v-model="edited.subcategory" type="text" class="form-control add-task" placeholder="Subcategory" />
                        </div>
                        <div class="form-group">
                            <input v-model="edited.units" type="number" min="0" class="form-control add-task" placeholder="Units" style="max-width: 5em;"/>
                        </div>
                        <div class="form-group text-right">
                            <button @click="addTask()" class="btn btn-default"><span class="glyphicon glyphicon-ok"></span></button>
                        </div>
                    </form></div>
                <div v-if="tasks.length">
                    <hr>
                    <table  class="table table-hover">
                        <thead>
                        <tr>
                            <th>Task name</th>
                            <th>Category</th>
                            <th>Subcategory</th>
                            <th>Units</th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="task in tasks">
                            <td>{{task.name}}</td>
                            <td>{{task.category}}</td>
                            <td>{{task.subcategory}}</td>
                            <td>{{task.units}}</td>
                            <td class="text-right">
                                <div class="btn-group">
                                    <button class="btn btn-default" @click="edit(task)"><span class="glyphicon glyphicon-edit"></span></button>
                                    <button class="btn btn-danger" @click="remove(task)"><span class="glyphicon glyphicon-remove"></span></button>
                                </div>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import store from '../store'
    var _ = require('lodash');
    
    export default {
        name: 'Current',
        data: function() {
            return {
                message :'Current!',
                edited : {},
                tasks : []
            }
        },
        route: {
            data : function(to) {
                document.title = 'Current is current';
                this.refresh();
            }
        },
        methods: {
            edit: function(task) {
                this.edited = task;
                el('addTaskName').focus();
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
                store.all().then(res => {
                    //pp(res);
                    this.tasks = res.rows.map(function (row) {
                        return row.doc;
                    });
                }).catch(err => {console.log(err)})
            },
            addTask: function(e) {
                if(this.edited.name && this.edited.category && this.edited.units) {
                    var clon = _.clone(this.edited);
                    if(this.edited._id) {
                        store.update(clon);
                    } else {
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