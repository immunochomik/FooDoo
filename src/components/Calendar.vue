<template>

  <div class="container-fluid">
    <div id='calendar'></div>
  </div>
</template>
<script>
  import $ from 'jquery';
  var _ = require('lodash');

  function calendar() {
    $('#calendar').fullCalendar({
      header: {
        left:   'title',
        center: '',
        right:  'today prev,next, basicWeek, month'
      },
      firstDay: 1,
      contentHeight: 1000,
      businessHours: {
        start: '08:00', // a start time (10am in this example)
        end: '18:00', // an end time (6pm in this example)
        dow: [ 1, 2, 3, 4, 5 ]
      }
    });
  }
  export default {
    name: 'Calendar',
    data: function() {
      return {
        message :'Callendar!'
      }
    },
    route: {
      data: function(to) {
        document.title = 'Calendar';
        setTimeout(calendar, 50);
      }
    },
  }
</script>
<style>

</style>