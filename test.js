'use strict';

const ratp_calls = require('./ratp_calls');
const tools  = require('./tools');

let type = 'bus'
  let code = '58'
  let result = 'hopitaux+broussais+et+saint+joseph'
  let way = 'R'
  let station = 'broussais'

/*
  ratp_calls.call_schedules(type, code, result, 'R').then((output) => {
    console.log('result : +'+JSON.stringify(output))
  }).catch((error) => {
    console.log('error '+error.result.message)
  })
  */

  Promise.race([
      ratp_calls.call_schedules(type, code, result, 'A+R'),
      ratp_calls.call_schedules(type, code, result, 'A'),
      ratp_calls.call_schedules(type, code, result, 'R')
  ]).then( (output) => {
    //console.log(JSON.stringify(output1))
    //console.log(JSON.stringify(output2))
    console.log(JSON.stringify(output))
  }).catch((error) => {
    console.log(JSON.stringify(error))
  })

/*
  var  ratp_calls.call_schedules(type, code, result, way).then((output) => {
    console.log('result : +'+JSON.stringify(output))
  }).catch((error) => {
    console.log('error '+error.result.message)
  })
*/