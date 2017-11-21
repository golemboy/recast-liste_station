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
  let memory = req.body.conversation.memory //on récupère les paramètre en mémoire

  let type = 'bus' //param par défaut au cas ou
  let code = '58'

  if (memory !== undefined) {
    console.log('call stations : JSON memory:'+JSON.stringify(memory))
    type = memory['transport-type'].value
    code = memory['transport-code'].value
    //console.log('transport-type:'+type+', transport-code:'+code)
  }

  ratp_calls.call_stations(type, code).then((output) => {
    //le bot a une mémoire de poisson rouge, on récupère ses paramètres memory
    memory.stations = output //on rajoute la liste des stations
    let response = {
      "replies": tools.to_replies(["je récupère la liste des stations"]),//tools.to_replies(output),
      "conversation": {
        "memory": memory //et on réinjecte la mémoire dans la réponse pour pouvoir la réutiliser
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

  let type = 'bus'
  let code = '58'
  let result = 'hopitaux+broussais+et+saint+joseph'
  let station = 'broussais'
  let way = 'A'
  let stations = []
  
  if (memory !== undefined) {
    console.log('call schedules : JSON memory:'+JSON.stringify(memory))
    type = memory['transport-type'].value
    code = memory['transport-code'].value
    station = memory['transport-station'].value
    stations = memory['stations']
    result = undefined
    //console.log(stations)
    if(stations !== undefined) {
      //recherche si la station donnée en paramètre existe dans la liste des stations données précédement
      //on récupère la bonne station dans le bon slug
      result = stations.find( (element) => {
        return element.includes(station) //recherche de type contains
      })
      
    }

    console.log('transport-type:'+type+', transport-code:'+code+', transport-station:'+result)

  }

  delete memory['transport-station'] //on supprime la station en mémoire pour pouvoir rechercher les horaires d'une autre station

  if (result === undefined) {
    res.send(tools.send_error({"result":{"message":"la station n'est pas correcte"}},memory))
  }

  ratp_calls.call_schedules(type, code, result,way).then((output) => {
    

    let response = {
      "replies": tools.schedules_to_replies(output),
      "conversation": {
        "memory": memory
      }
    }
    console.log('send response : JSON response:'+JSON.stringify(response))
    res.send(response)

  }).catch((error) => {
    res.send( tools.send_error(error, memory) )
  })

});

app.post('/errors', (req, res) => {
  console.log(req.body)
  res.send()
})

app.listen(server_port, () => {
  console.log('Server is running on port 5000')
})
