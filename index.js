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

const app = express() 
const server_port = 5000 
app.use(bodyParser.json()) 

app.post('/stations', (req, res) => {
  let memory = req.body.conversation.memory
  
  console.log('JSON memory:'+JSON.stringify(memory))
   let type = memory['transport-type'].value
   let code = memory['transport-code'].value
   console.log('transport-type:'+type+', transport-code:'+code)
    
  ratp_calls.call_stations(type, code).then((output) => {
    let response = {
      replies: tools.to_replies(output),
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

app.post('/schedules', (req, res) => {
  let memory = req.body.conversation.memory
  
  let type = memory['transport-type'].value
  let code = memory['transport-code'].value
  let station = memory['transport-station'].value
  console.log('transport-type:'+type+', transport-code:'+code+', transport-station:'+station)
  
  console.log('JSON memory:'+JSON.stringify(memory));
  
  ratp_calls.call_schedules(type, code, station).then((output) => {
    let response = {
      replies: tools.schedules_to_replies(output),
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
  
});

app.post('/errors', (req, res) => {
  console.log(req.body) 
  res.send() 
}) 

app.listen(server_port, () => { 
  console.log('Server is running on port 5000') 
})