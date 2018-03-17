'use strict';

var flatten = (arr) => {
    return Array.prototype.concat(...arr);
}

module.exports.to_replies = function (arr) {
  return arr.map( (elem) =>  {return {'type': 'text', 'content':elem}}  );
}

module.exports.schedules_to_replies = function (arr) {
  return flatten(arr).map( (elem) =>  {    
    let value = elem.destination+':'+elem.message;
    return {'type': 'text', 'content':value}
  }  );
}

module.exports.send_error = (error,memory) => {
      let response = {}
      response.replies = [{
        'type': 'text',
          'content': error.result.message,
      }]

      response.conversation = {
        'memory': memory
      }

      return response
}
