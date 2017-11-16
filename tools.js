'use strict';
module.exports.to_replies = function (arr) {
  return arr.map( (elem) =>  {return {type: 'text', content:elem}}  );  
}
