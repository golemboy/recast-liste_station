/*
//http://192.168.1.8:5000/stations/
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

//http://192.168.1.8:5000/schedules/

{
"conversation": {
    "memory": {
      "transport-type": {
        "value": "bus",
        "raw": "bus"
      },
      "transport-code": {
        "value": "58",
        "raw": "58"
      },
      "stations": [
        "chatelet",
        "pont+neuf+++quai+du+louvre",
        "pont+neuf+++quai+des+grands+augustins",
        "mazarine",
        "saint+germain+++odeon",
        "senat",
        "musee+du+luxembourg",
        "guynemer+vavin",
        "brea+++notre+dame+des+champs",
        "vavin",
        "place+du+18+juin+1940",
        "place+du+18+juin+1940+++rue+du+depart",
        "gare+montparnasse",
        "gaite",
        "losserand+++maine",
        "chateau+++mairie+du+14e",
        "rue+benard",
        "alesia+++les+plantes",
        "hop.+notre+dame+de+bon+secours+++a.+chantin",
        "jean+moulin",
        "porte+de+chatillon",
        "porte+didot+++lycee+raspail",
        "porte+de+vanves",
        "pont+de+la+vallee",
        "jean+jaures+jean+bleuzen",
        "carrefour+albert+legris",
        "vanves+lycee+michelet",
        "colonel+monteil",
        "didot",
        "hopitaux+broussais+et+saint+joseph",
        "alesia+++didot",
        "pernety",
        "chateau",
        "notre+dame+des+champs",
        "raspail+++fleurus",
        "fleurus",
        "theatre+de+l'odeon",
        "saint+andre+des+arts"
      ], "transport-station":{
          "value": "broussais",
          "raw": "broussais"
      }     
    }
  }
}
*/

'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const ratp_calls = require('./ratp_calls');
const tools  = require('./tools');

const app = express()
const server_port = process.env.NODE_PORT || 5000
app.use(bodyParser.json())

app.post('/stations', (req, res) => {
  let memory = req.body.conversation.memory //on récupère les paramètre en mémoire

  let type = 'bus' //param par défaut au cas ou
  let code = '58'

  if (memory !== undefined) {
    console.log('call stations : JSON memory:'+JSON.stringify(memory))
    type = memory['transport-type'].value
    code = memory['transport-code'].value
  }

  ratp_calls.call_stations(type, code).then((output) => {
    //le bot a une mémoire de poisson rouge, on récupère ses paramètres memory
    memory.stations = output //on rajoute la liste des stations
    let response = {
      "replies": tools.to_replies(["je récupère la liste des stations, quelle station ?"]),//tools.to_replies(output),
      "conversation": {
        "memory": memory //et on réinjecte la mémoire dans la réponse pour pouvoir la réutiliser
      }
    }

    res.send(response)

  }).catch((error) => {
    delete memory['transport-code'] //on supprime le code en mémoire car il n'est pas bon
    res.send( tools.send_error(error, memory) )
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
    if(stations !== undefined && station !== undefined) {
      //recherche si la station donnée en paramètre existe dans la liste des stations données précédement
      //on récupère la bonne station dans le bon slug
      result = stations.find( (element) => {
        return element.includes(station) //recherche de type contains
      })    
    } 
    
    else {
      if (type !== undefined && code !== undefined && station !== undefined) {
        ratp_calls.call_stations(type, code).then((output) => {
          //le bot a une mémoire de poisson rouge, on récupère ses paramètres memory
            stations = output //on rajoute la liste des stations            
            //stations = memory.stations          
            //console.log(stations)

            
            result = stations.find( (element) => {
              return element.includes(station) //recherche de type contains
            })
            console.log(station+" "+result)

        }).catch((error) => {
          res.send(tools.send_error({"result":{"message":"la station n'est pas correcte"}},memory))
        })
        
      }
    }
    


    console.log('transport-type:'+type+', transport-code:'+code+', transport-station:'+result)

  }

  delete memory['transport-station'] //on supprime la station en mémoire pour pouvoir rechercher les horaires d'une autre station

  if (result === undefined) {
    res.send(tools.send_error({"result":{"message":"la station n'est pas correcte"}},memory))
  }

  //Promise.all => on appel l'API sur les 2 directions A et R
  Promise.all([
      ratp_calls.call_schedules(type, code, result, 'A'),
      ratp_calls.call_schedules(type, code, result, 'R')
      //le trick `.map(p => p.catch(() => undefined))` aprés la fin du tableau où sont passés les 2 Promise,
      //permet d'aller sur `then()` même si une promesse n'est pas respectée
      //si la station demandée est valable dans les 2 directions, on va pousser les horaires des 2 directions
      //si elle n'est valable que sur une direction, on pousse quand même les horaires de la bonne direction
      //https://davidwalsh.name/promises-results
  //].map(p => p.catch(() => undefined))).then( (output) => {
  ].map(p => p.catch(() => [{"message":"....","destination":"...."}]))).then( (output) => {


    let response = {
      "replies": tools.schedules_to_replies(output),
      "conversation": {
        "memory": memory
      }
    }
    //console.log('send response : JSON response:'+JSON.stringify(response))
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
