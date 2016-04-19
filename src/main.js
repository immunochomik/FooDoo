import Vue from 'vue';
import App from './App.vue';
import Router from 'vue-router';
import Current from './components/Current.vue';
import Analysis from './components/Analysis.vue';
import Calendar from './components/Calendar.vue';
import Data from './components/Data.vue';
require('expose?$!expose?jQuery!jquery');
require('bootstrap-webpack');
require('bootstrap/dist/css/bootstrap-theme.min.css');


var _ = require('lodash');
import helpers from './helpers/helpers.js';
_.extend(window, helpers);

// install router
Vue.use(Router);

// routing
var router = new Router();


router.map({
  '/current': {
    component: Current
  },
  '/calendar': {
    component: Calendar
  },
  '/analysis': {
    component: Analysis
  },
  '/data' : {
    component: Data
  }
});

router.beforeEach(function () {
  window.scrollTo(0, 0)
});

router.redirect({
  '*': '/current'
});

router.start(App, 'app');


