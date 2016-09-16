/**
 * Created by tomek on 06/09/16.
 */
  
var TagsParser = (function() {
  function Def(tagTypes) {
    if(!tagTypes || typeof tagTypes !== 'object') {
      throw new Error('Invalid argument tag types has to be an object');
    }
    this.tagTypes = tagTypes;
    this.tags = {};
    this.currentWord = '';
    this.currentTag = '';
  }
  Def.prototype.getTags = function() {
    return this.tags;
  };
  Def.prototype.appendToTag = function() {
    if(!(this.currentTag in this.tags)) {
      this.tags[this.currentTag] = [];
    }
    this.tags[this.currentTag].push(this.currentWord);
    console.log(this.tags);
    this.currentWord = this.currentTag = '';
  };
  Def.prototype.parse = function(str) {
    if(typeof str != 'string') {
      throw new Error('String has to be string');
    }
    for(var i = 0; i < str.length; i++ ) {
      if(this.currentWord != '') {
        if(str[i] == ' ') { // end of the word
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
    return this.tags;
  };
  return Def;
})();

export default {
  TagsParser: TagsParser
}