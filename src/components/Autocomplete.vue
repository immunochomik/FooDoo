<template>
  <div>
    <input v-model="text" type="text" :id="id" :name="name" :placeholder="placeholder" :class="class" :style="style"
        @keyup.down="focus(0)" @keyup="onChange()">
      <ul v-if="list.length" class="list-unstyled text-left autocomplete" :style="style">
        <li class="autocomplete" v-for="(i, item) in list">
          <input class="autocomplete" id="suggestion_{{i}}"  @keyup.down="focus(i+1)" @keyup.up="focus(i-1)" @keyup.enter="choose(item)" value="{{item.name}}"/></li>
      </ul>
  </div>
</template>

<script>
  export default {
    props: [
      'id',
      'name',
      'placeholder',
      'list',
      'class',
      'text',
      'tags',
      'style',
    ],

    data: function () {
      return {
      }
    },

    methods: {
      onChange : function() {
        console.log('change');
        if(this.text.length === 0) {
          this.list = [];
        }
      },
      choose: function(item) {
        this.text = item.name;
        this.tags = item.tags.join(', ');
        this.list = [];
        el(this.id).focus();
      },
      focus: function(id) {
        if(id === -1) {
          el(this.id).focus();
        } else {
          var li = el('suggestion_' + id);
          console.log(li);
          if (li) {
            li.focus();
          }
        }
      }
    }
  }
</script>

<style>
  ul.autocomplete {
    position: absolute;
    box-shadow: rgba(0, 0, 0, 0.2) 0px 2px 4px 0px;
    border-top: 1px solid rgb(217, 217, 217);
    border-right: 1px solid rgb(204, 204, 204);
    border-bottom: 1px solid rgb(204, 204, 204);
    border-left: 1px solid rgb(204, 204, 204);
  }
  input.autocomplete {
    border: 0;
    min-height: 2em;
    padding: 2px;
    width: 100%;
  }
  input.autocomplete:focus {
    background-color: silver;
  }
</style>