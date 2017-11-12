const https = require('https');
const host = 'api-ratp.pierre-grimaud.fr';
const port = 443;


'use strict';
/*
exports.listeStations = (req, res) => {

}
*/
function callListeStations (type, code) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP get request to the APi
    let path = '/v3/stations/'+type+'/'+code+'?_format=json';
    console.log('API Request: ' + host + path);
    // Make the HTTP get request to get the API
    https.get({host: host, path: path, port: port}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let stations = JSON.parse(body).result.stations;
        let liste_stations = '';
        for(let station of stations) {
          liste_stations += station.slug+'\n';          
        }
        
        // Create response
        let output = `Voici la liste des stations :\n${liste_stations}`;
        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        reject(error);
      });
    });
  });
}


const express = require('express')
const bodyParser = require('body-parser')

const app = express() 
const server_port = 5000 
app.use(bodyParser.json()) 

app.post('/', (req, res) => {
  let memory = req.body.conversation.memory
  let type = memory['transport-type'].value
  let code = memory['transport-code'].value
  console.log('parametre :'+type+code)

  callListeStations(type, code).then((output) => {
    let response = {
    replies: [{
      type: 'text',
      content: ['output',' \r\n ','klmkml','456fdsf',' \r\n ','hdjskhfjsdk',' \r\n '],
    }], 
    conversation: {
      memory: { key: 'value' }
    }
  }
  res.send(response)
  }).catch((error) => {
    res.send({
    replies: [{
      type: 'text',
      content: 'Roger that',
    }], 
    conversation: {
      memory: { key: 'value' }
    }
  })
  })

  
})

app.post('/errors', (req, res) => {
  console.log(req.body) 
  res.send() 
}) 

app.listen(server_port, () => { 
  console.log('Server is running on port 5000') 
})