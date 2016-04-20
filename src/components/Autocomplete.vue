<template>
  <div>
    <input v-model="text" type="text" :id="id" :name="name" :placeholder="placeholder" :class="class" :style="style"
        @keyup.down="focus(0)">
    <ul v-if="list.length" class="list-unstyled list-group text-left autocomplete">
      <li :style="style" class="list-group-item" v-for="(i, item) in list">
        <input class="form-control" id="suggestion_{{i}}" @keyup.down="focus(i+1)" @keyup.up="focus(i-1)" @keyup.enter="choose(item)" value="{{item.name}}"/></li>
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
      'style'
    ],

    data: function () {
      return {
      }

    },
    methods: {
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
  }
</style>