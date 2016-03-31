<template>
    <!--<link rel="stylesheet" type="text/css" href="../../node_modules/bootstrap/dist/css/bootstrap.min.css" >-->
    <div class="container-fluid">
        <div class="panel panel-default">
            <div class="panel-body">
                <div class="row">
                    <form>
                        <div class="col-sm-6 add-task">
                            <input id="addTaskName" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name" required="required"/>
                        </div>
                        <div class="col-sm-2 add-task">
                            <input v-model="edited.category" type="text" class="form-control add-task" placeholder="Category" />
                        </div>
                        <div class="col-sm-2 add-task">
                            <input v-model="edited.subcategory" type="text" class="form-control add-task" placeholder="Subcategory" />
                        </div>
                        <div class="col-sm-1 add-task">
                            <input v-model="edited.units" type="number" min="0" class="form-control add-task" placeholder="Units" required/>
                        </div>
                        <div class="col-sm-1 add-task">
                            <input type="submit" @click="addTask($event)" class="btn btn-warning form-control" value="Add"/>
                        </div>
                    </form>
                </div>
                <div v-if="tasks.length">
                    <hr>
                    <table  class="table table-hover">
                        <thead>
                        <tr>
                            <th>Task name</th>
                            <th>Category</th>
                            <th>Subcategory</th>
                            <th>Units</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr v-for="task in tasks">
                            <td>{{task.name}}</td>
                            <td>{{task.category}}</td>
                            <td>{{task.subcategory}}</td>
                            <td>{{task.units}}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    var _ = require('lodash');
    export default {
        name: 'Current',
        data: function() {
            return {
                message :'Current!',
                tasks : [],
                edited : {}
            }
        },
        methods: {
            addTask: function(e) {
                e.preventDefault();
                if(this.edited.name && this.edited.category && this.edited.units) {
                    var clon = _.clone(this.edited);
                    this.tasks.push(clon);
                    $('input.add-task').val('');
                    $('#addTaskName').focus();
                    this.edited.name = this.edited.category = this.edited.units = '';
                }
            }
        }
    }
</script>
<style>
    div.add-task {
        padding: 4px;
    }
    input.add-task {
        padding: 2px;
    }
</style>