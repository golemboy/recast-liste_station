'use strict';
module.exports.toReplies = function (arr) {
  return arr.map( (elem) =>  {return {type: 'text', content:elem}}  );  
}
