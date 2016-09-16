/**
 * Created by tomek on 06/09/16.
 */
  
var TagsParser = (function() {
  function Def(tagTypes) {
    if(!tagTypes || typeof tagTypes !== 'object') {
      throw new Error('Invalid argument tag types has to be an object');
    }
    console.log(typeof tagTypes);
    this.tagTypes = this.prepareTagTypes(tagTypes);
    this.tags = {};
    this.currentWord = '';
    this.currentTag = '';
  }
  Def.prototype.prepareTagTypes = function(tagTypes) {
    var types = {};
    tagTypes.forEach(function(item) {
      types[item.sign] = item.name;
    });
    return types;
  };
  Def.prototype.getTags = function() {
    return this.tags;
  };
  Def.prototype.appendToTag = function() {
    if(!this.currentTag || !this.currentWord) {
      return;
    }
    var type = this.tagTypes[this.currentTag];
    if(!(type in this.tags)) {
      this.tags[type] = {};
    }
    this.tags[type][this.currentWord] = true;
    this.currentWord = this.currentTag = '';
  };
  Def.prototype.parse = function(str) {
    if(typeof str != 'string') {
      throw new Error('String has to be string');
    }
    for(var i = 0; i < str.length; i++ ) {
      if(this.currentWord != '') {
        if(str[i].match(/\s/)) { // end of the word
          this.appendToTag();
          continue;
        }
        this.currentWord += str[i];
      }
      if(str[i] in this.tagTypes) {
        this.currentTag = str[i];
        if(str[i+1] !== undefined) {
          this.currentWord += str[i+1];
          i++;
        }
      }
    }
    this.appendToTag();
    return this.tags;
  };
  return Def;
})();

export default {
  TagsParser: TagsParser
}