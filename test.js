'use strict';

const ratp_calls = require('./ratp_calls');
const tools  = require('./tools');

var flatten = (arr) => {
    return Array.prototype.concat(...arr);
}

let type = 'bus'
  let code = '58'
  let result = 'hopitaux+broussais+et+saint+joseph'
  let way = 'R'
  let station = 'broussais'


  Promise.all([
      //ratp_calls.call_schedules(type, code, result, 'A+R'),
      ratp_calls.call_schedules(type, code, result, 'A'),
      ratp_calls.call_schedules(type, code, result, 'R')
  ].map(p => p.catch(() => [{"message":"....","destination":"...."}]))).then( (output) => {
    //console.log(JSON.stringify(output1))
    //console.log(JSON.stringify(output2))

    console.log(JSON.stringify(flatten(output)))
  }).catch((error) => {
    console.log('error : '+JSON.stringify(error))
  })
