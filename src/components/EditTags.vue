<template>
  <div class="modal-mask" v-show="show" transition="modal">
    <div class="modal-wrapper">
      <div class="modal-container">
        <div class="modal-header">
          <h3>Tags Editor</h3>
        </div>
        <div class="modal-body" style="padding: 5px;">
          <div>
            <h4>Tags Types</h4>
            <div v-show="error" id="error" class="alert alert-danger form-group">
              {{error}}
            </div>
            <table class="table table-hover table-striped table-condensed">
              <thead>
                <tr>
                <th>Tag Type Name</th>
                <th class="text-center">Sing</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
                <tr v-for="type in types">
                  <td>{{type.name}}</td>
                  <td class="text-center">{{type.sign}}</td>
                  <td class="text-right"><button @click="remove(type.name)" class="btn btn-danger btn-xs">
                    <span class="glyphicon glyphicon-remove"></span></button></td>
                </tr>
                <tr>
                  <td style="width: 70%">
                    <input class="form-control" type="text" v-model="newName"/>
                  </td>
                  <td>
                    <input class="form-control" type="text" v-model="newSign"/>
                  </td>
                  <td class="text-right"><button @click="addTagType()" class="btn btn-info btn-xs">
                    <span class="glyphicon glyphicon-plus"></span></button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-default modal-default-button"
                    @click="show = false">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import StoreCollection from '../storeCollection';
  var _ = require('lodash');

  export default {
    name: 'EditTags',
    props: {
      show: {
        type: Boolean,
        required: true,
        twoWay: true
      }
    },
    data: function () {
      return {
        documentId : 'tagsDataDocumentThisIsSoUnique',
        newSign : '',
        newName : '',
        edited : false,
        types: [],
        store: null,
        error: '',
      }
    },
    methods: {
      remove:function(name) {
        console.log(name);
        this.types = this.types.filter(function(row) {
          return row.name != name;
        });
        this.edited = true;
      },
      addTagType: function() {
        if(this.newSign && this.newName) {
          var self = this;
          var error = false;
          _.each(this.types, function(item) {
            if(self.newSign === item.sign || self.newName == item.name ) {
              self.error = 'Names and signs has to be unique!';
              error = true;
            }
          });
          if(error) {
            return;
          } else {
            self.error = '';
          }
          this.types.push({name: this.newName, sign: this.newSign});
          this.edited = true;
          this.newSign = this.newName = '';
        }
      },
      reload: function() {
        // get types document form storage
        var self = this;
        this.makeStore();
        this.store.get(this.documentId).then(res => {
            self.types = res.types;
        }).catch(err => {
            console.log('Error', err);
        });
      },
      save: function() {
        if(!this.edited) {
          return;
        }
        this.makeStore();
        var doc = {
          _id : documentId,
          types: _.clone(this.types),
        };
        this.store.update(doc);
        this.edited = false;
      },
      makeStore: function() {
        if(!this.store) {
           this.store = new StoreCollection.Collection('tasks2');
        }
      }
    },
    watch: {
      show: function(show) {
        if(show === true) {
          this.reload();
        } else {
          this.save();
        }
      }
    }
  }
</script>

<style>
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, .5);
    display: table;
    transition: opacity .3s ease;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
    width: 50%;
    margin: 0 auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
    transition: all .3s ease;
    font-family: Helvetica, Arial, sans-serif;
  }

  .modal-header h3 {
    margin-top: 0;
    color: #42b983;
  }

  .modal-body {
    margin: 2px 0;
  }

  .modal-default-button {
    float: right;
  }

  /*
   * the following styles are auto-applied to elements with
   * v-transition="modal" when their visiblity is toggled
   * by Vue.js.
   *
   * You can easily play with the modal transition by editing
   * these styles.
   */

  .modal-enter, .modal-leave {
    opacity: 0;
  }

  .modal-enter .modal-container,
  .modal-leave .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>