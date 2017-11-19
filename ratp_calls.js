const https = require('https');
const host = 'api-ratp.pierre-grimaud.fr';
const port = 443;

'use strict';

const type_transport = {
  'métro':'metros',
  'métros':'metros',
  'metro':'metros',
  'metros':'metros',
  'bus':'bus',
  'rer':'rers',
  'rers':'rers',
  'tram':'tramways',
  'trams':'tramways',
  'tramway':'tramways',
  'tramways':'tramways'
}

var get_type = (value) => {
  let transport_type = undefined;
  transport_type = type_transport[value.toLowerCase().trim()];
  if(transport_type === undefined) transport_type = value.toLowerCase().trim();
  return transport_type;
}

var api_calls = (options) => {
  return new Promise((resolve, reject) => {
    // Make the HTTP get request to get the API
    https.get(options, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response
      res.on('end', () => {
        resolve(JSON.parse(body));
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

module.exports.call_stations = function (type, code) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP get request to the APi
    let path = '/v3/stations/'+get_type(type)+'/'+code+'?_format=json';
    console.log('API Request: ' + host + path);
    // Make the HTTP get request to get the API
    https.get({host: host, path: path, port: port}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let stations = JSON.parse(body).result.stations;
        let output = stations.map( (station) => station.slug );
        // Resolve the promise with the output text
        //console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}

module.exports.call_schedules = function (type, code, station) {
  let path = '/v3/schedules/'+type+'/'+code+'/'+station+'/A?_format=json';
  return api_calls({host: host, path: path, port: port}).then( (content) => {
     console.log( JSON.stringify(content.result.schedules));
    return new Promise((resolve, reject) => {
      resolve(content.result.schedules);
    });
  }).catch( (error) => {
    return new Promise((resolve, reject) => {
      reject(error);
    });
  });
}
