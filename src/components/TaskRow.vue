<template>
  <tr>
    <td @click="$parent.edit(task, mode, 'name')">{{task.name}}</td>
    <td @click="$parent.edit(task, mode, 'units')">{{task.units[mode]}}</td>
    <td class="text-right">
      <button v-if="mode == 'plan'" class="btn btn-info btn-xs"
              @click="$parent.taskDone(task)">
          <span class="glyphicon glyphicon-menu-down"></span>
      </button>
      <button v-if="mode == 'done'" class="btn btn-info btn-xs"
              @click="$parent.moveToPlan(task)">
        <span class="glyphicon glyphicon-menu-up"></span>
      </button>
      <button class="btn btn-info btn-xs" @click="$parent.copyToNextDay(task)">
        <span class="glyphicon glyphicon-menu-right"></span></button>
      <button class="btn btn-danger btn-xs" @click="$parent.remove(task)">
        <span class="glyphicon glyphicon-remove"></span></button>
    </td>
  </tr>
</template>

<script>
  export default {
    name: 'TaskRow',
    props : ['task', 'mode'],
    data: function () {
      return {
        //mode : 'taskPlaned'
      }
    },
  }
</script>

<style>
  tr {
    width: 100%;
  }
</style>