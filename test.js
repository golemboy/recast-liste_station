//import { stat } from 'fs';

'use strict';

const ratp_calls = require('./ratp_calls');
const tools  = require('./tools');

let type = 'bus'
  let code = '58'
  let result = ''
  //let way = 'R'
  let station = 'didot'
  let stations = ''

  // Promise.all([
  //     //ratp_calls.call_schedules(type, code, result, 'A+R'),
  //     ratp_calls.call_schedules(type, code, result, 'A'),
  //     ratp_calls.call_schedules(type, code, result, 'R')
  // ].map(p => p.catch(() => [{"message":"....","destination":"...."}]))).then( (output) => {
  //   //console.log(JSON.stringify(output1))
  //   //console.log(JSON.stringify(output2))

  //   console.log(JSON.stringify(flatten(output)))
  // }).catch((error) => {
  //   console.log('error : '+JSON.stringify(error))
  // })

  ratp_calls.call_stations(type, code).then((output) => {
    stations = output
    console.log(stations)

    result = stations.find( (element) => {
      return element.includes(station) //recherche de type contains
    })
    console.log("station recherchée :"+station+" - station trouvée :"+result)
    return result
  }).then((result)=> {
    return ratp_calls.call_schedules(type, code, result, 'A+R').catch(() => {
      return ratp_calls.call_schedules(type, code, result, 'A').catch(() => {
        return ratp_calls.call_schedules(type, code, result, 'R')     
  }).then((output) => {
    console.log(output)
  }).catch((error) => {
    console.log(error)
  })