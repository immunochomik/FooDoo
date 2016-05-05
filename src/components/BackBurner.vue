<template>
  <div id="mainDiv" class="container-fluid">
    <div v-show="error" class="alert alert-danger form-group" >
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
      <form class="form-inline2" autocomplete="off" v-on:submit.prevent >
        <div class="form-group">
          <input id="nameToDo" v-model="edited.name" type="text" class="form-control add-task" placeholder="Task name" style="width: 160px;"/>
        </div>
        <div class="form-group">
          <input id="tagsToDo" v-model="edited.tags" type="text" class="form-control add-task" placeholder="Tags" style="width: 160px;"/>
        </div>
        <div class="form-group">
          <input id="unitsToDo" v-model="edited.units" type="number" min="0" step="any" class="form-control add-task" placeholder="Units" style="width: 60px;"/>
        </div>
        <div class="form-group">
          <input id="priorityToDo" v-model="edited.priority" type="number" min="0" step="1" max="10" class="form-control add-task" placeholder="Priority" style="width: 60px;"/>
        </div>
        <div id="parseButtonDivToDo" class="form-group text-right">
          <button id="parseButtonToDo" @click="parseTask()" class="btn btn-default" style="width: 40px;"><span class="glyphicon glyphicon-ok" ></span></button>
        </div>
      </form>
    </div>
  </div>

</template>

<script>
  var resizeForm = function() {
    if(document.getElementById('nameToDo')) {
      var width = {
        nameToDo: (window.innerWidth - 367 ) + 'px',
        tagsToDo: '160px',
        unitsToDo: '60px',
        priorityToDo: '60px',
        parseButtonDivToDo: '40px',
        parseButtonToDo: '40px'
      };
      if(window.innerWidth < 528) {
        for(var id in width) {
          document.getElementById(id).style.width = '100%';
          document.getElementById(id).style.dispaly = 'block';
        }
      } else {
        for(var id in width) {
          document.getElementById(id).style.width = width[id];
        }
      }
    }
  };


  export default {
    name: 'BackBurner',
    data: function () {
      return {
        edited : {
          name : '',
          tags: '',
          eUnits: ''
        },
        error:false,
        editCancelable : false
      }
    },
    route: {
      data: function (to) {
        window.onresize = resizeForm;
        document.title = 'To Do';
      }
    },
    events : {
      'hook:created' : function() {
        console.log('created');
      },
      'hook:ready': function() {
        resizeForm();
      }
    },
    methods: {}
  }
</script>

<style>
</style>