<template>
  <div>
    <input v-model="text" type="text" id="inputMain" :name="name" :placeholder="placeholder" :class="class" :style="style"
        @keyup.down="focus(0)">
    <ul v-if="list.length" class="list-unstyled list-group text-left">
      <li :style="style" class="list-group-item" v-for="(i, item) in list">
        <input class="form-control" id="suggestion_{{i}}" @keyup.down="focus(i+1)" @keyup.up="focus(i-1)" @keyup.enter="choose(item)" value="{{item}}"/></li>
    </ul>
  </div>
</template>

<script>
  export default {
    props: [
      'name',
      'placeholder',
      'list',
      'class',
      'text',
      'style'
    ],

    data: function () {
      return {
      }

    },
    methods: {
      choose: function(text) {
        this.text = text;
        this.list = [];
        el('inputMain').focus();
      },
      focus: function(id) {
        if(id === -1) {
          el('inputMain').focus();
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
  ul {
    position: absolute;
  }
</style>