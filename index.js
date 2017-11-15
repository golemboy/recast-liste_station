/*
//JSON simplifié envoyé par recast
{         
  "conversation":
    {  
    "memory":
      {
      "transport-type":
        {
        "value":"bus",
        "raw":"bus"       
        },
      "transport-code":
        {
        "value":"58",
        "raw":"58"        
        }
      },    
    "language":"fr"
  }
}
*/

'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const ratp_calls = require('./ratp_calls');
const tools  = require('./tools');

/*
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
        let output = stations.map( (station) => station.slug  );
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

function toReplies ( arr) {
  return arr.map( (elem) =>  {return {type: 'text', content:elem}}  );  
}
*/

const app = express() 
const server_port = 5000 
app.use(bodyParser.json()) 

app.post('/', (req, res) => {
  let memory = req.body.conversation.memory
  
  console.log('JSON memory:'+JSON.stringify(memory))
   let type = memory['transport-type'].value
   let code = memory['transport-code'].value
   console.log('transport-type:'+type+', transport-code:'+code)
    
  ratp_calls.callListeStations(type, code).then((output) => {
    let response = {
      replies: tools.toReplies(output),
      conversation: {
        memory: { key: 'value' }
      }
    }
  
    res.send(response)
  }).catch((error) => {
    res.send({
    replies: [{
      type: 'text',
      content: error,
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