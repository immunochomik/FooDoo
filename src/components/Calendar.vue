<template>

  <div class="container-fluid">
    <div id='calendar'></div>
  </div>
</template>
<script>
  import StoreCollection from '../storeCollection';
  import $ from 'jquery';
  var _ = require('lodash');
  var store = new StoreCollection.Collection('tasks2');

  var first = true;
  export default {
    name: 'Calendar',
    data: function() {
      return {
        month: null,
      }
    },
    route: {
      data: function(to) {
        document.title = 'Calendar';
        var self = this;
        setTimeout(function() { self.calendar() }, 25);
      }
    },
    methods: {
      calendar : function () {
        var calendar = $('#calendar');
        if(first) {
          first = false;
          calendar.fullCalendar({
            header: {
              left:   'title',
              center: '',
              right:  'today prev,next, basicWeek, month'
            },
            firstDay: 1,
            contentHeight: 600,
            dayClick: function(date, jsEvent, view, resourceObj) {
              //alert('Date: ' + date.format());
              window.location = '/#!/current?day=' + date.format();
            },
            businessHours: {
              start: '08:00', // a start time (10am in this example)
              end: '18:00', // an end time (6pm in this example)
              dow: [ 1, 2, 3, 4, 5 ]
            },
            events: function(start, end, timezone, callback) {
              store.query('index/by_day', {
                startkey: start.format('YYYY-MM-DD'),
                endkey: end.format('YYYY-MM-DD'),
                include_docs: true
              }).then(res => {
                var tasks = [];
                var seenIds = {};
                _.each(res.rows, function(item) {
                  if (!item.doc || seenIds[item.id]) return;
                  seenIds[item.id] = true;
                  tasks.push({
                    title : item.doc.name,
                    start : item.doc.day,
                    allDay : true
                  });
                });
                callback(tasks);
              }).catch(err => {
                console.log(err)
              })
            }
          });
        } else {
          calendar.fullCalendar('refetchEvents');
        }

      }
    }
  }
</script>
<style>

</style>