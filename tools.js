'use strict';
module.exports.to_replies = function (arr) {
  return arr.map( (elem) =>  {return {type: 'text', content:elem}}  );  
}

module.exports.schedules_to_replies = function (arr) {
  return arr.map( (elem) =>  {
    let value = elem.destination+':'+elem.message;
    return {type: 'text', content:value}
  }  );  
}
