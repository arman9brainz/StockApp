const express = require('express');

const app = express();

const port =4000;

const WebSocket = require('ws');

var http = require("http").createServer(app);

const io = require("socket.io")(http);

//require("dotenv").config();

// const config = require('./config');

// WebSocket URL

const url = 'ws://smartapisocket.angelone.in/smart-stream';



$feedToken  = 'eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6Ik5JVkUxMDA4IiwiaWF0IjoxNjkwMDA0MTM5LCJleHAiOjE2OTAwOTA1Mzl9.Jw1Rkgvm4QAuQXiTp9ZEuE02TEX5IoEvZ_8Ht479p7hxZdzRh8uWBti4AteuOHYXr3_W-Yid1_i_CQrIX471AA';

$clientId = 'nive1008';

$apiKey = 'L6BZIxF6';



// Authentication headers

const headers = {

  'Authorization': 'Bearer eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6Ik5JVkUxMDA4Iiwicm9sZXMiOjAsInVzZXJ0eXBlIjoiVVNFUiIsImlhdCI6MTY5MDAwNDEzOSwiZXhwIjoxNjkwMDkwNTM5fQ.FC5iAp8EEGpbguIKc93fXSzU5pIBki4fnVX2QKKJaaYoH9UMb71Wi9j_PzLgPLsOuzzcwY0IeSHTkdCCiOgoVA',

  'x-api-key': 'L6BZIxF6',

  'x-client-code': $clientId,

  'x-feed-token': $feedToken,

};



// Create a WebSocket instance

const webSocket = new WebSocket(url, { headers });


// Map to store tokenID to tokenName mapping

const tokenMapping = {

  '52975': 'BANKNIFTY27JUL2345700PE',

  '52974' : 'BANKNIFTY27JUL2345700CE'

};


var tokenIDArray = Object.keys(tokenMapping);


// Store the received data in an array

//let receivedData = []

// Handle WebSocket connection open

webSocket.on('open', () => {

  //console.log('WebSocket cosubscriptionnnected');


   // Send a subscription request

   const subscriptionRequest = {

    //correlationID: '',

    action: 1,

    params: {

      mode: 2,

      tokenList: [

        {

          exchangeType: 2,

          tokens: tokenIDArray,

        },

        // {

        //   exchangeType: 5,

        //   tokens: ['245896'],

        // },

      ],

    },

  };


  webSocket.send(JSON.stringify(subscriptionRequest));

});


// Store the latest data for each instrument

const latestData = {};


// Handle received messages from the WebSocket

webSocket.on('message', (message) => {

  const data = new Uint8Array(message);


  // Check if the message is a heartbeat response

  if (data.length === 4 && data[0] === 112 && data[1] === 111 && data[2] === 110 && data[3] === 103) {

    // Ignore heartbeat response

    return;

  }

  // Parse the received binary data based on the provided response contract


  // Extract the Last Traded Price (LTP) and Token ID from the received data

  const ltpBytes = data.slice(43, 47);

  const closePriceBytes = data.slice(115, 122);

  const tokenIDBytes = data.slice(2, 27);

  const ltpValue = ltpBytes.reduce((value, byte, index) => value + byte * Math.pow(256, index), 0);

  const closePrice = closePriceBytes.reduce((value, byte, index) => value + byte * Math.pow(256, index), 0);

  const ltp = ltpValue / 100;

  const yesterdayPrice = closePrice / 100;

  const priceChange = parseFloat((ltp-yesterdayPrice).toFixed(2));

  const percentChange = parseFloat(((priceChange/ltp)*100).toFixed(2));


//  const decoder = new TextDecoder('utf-8');

  const tokenID = new TextDecoder().decode(tokenIDBytes).replace(/\u0000/g, '');//To decode from Bytes and remove the null characters at the end of tokenID

  const tokenName = tokenMapping[tokenID];//retrieves token name for the corresponding tokenID from the tokenMapping

  // Create a JSON object with tokenID and ltp

  const jsonData = {

    tokenName: tokenName,

    token : tokenID,

    ltp: ltp,

    yesterdayPrice:yesterdayPrice,

    change:priceChange,

    percentChange:percentChange,

  };


  // Store the latest data for the instrument

  latestData[tokenID] = jsonData;

  // console.log(latestData)

  // Display the JSON object

   console.log(jsonData);

});


// Handle WebSocket connection close

webSocket.on('close', () => {

  console.log('WebSocket connection closed');

});


// Send heartbeat message every 30 seconds to keep the connection alive

setInterval(() => {

  if (webSocket.readyState === WebSocket.OPEN) {

    webSocket.send('ping');

  }

}, 1000);


// Enable CORS

app.use((req, res, next) => {

  res.header('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  next();

});


// a GET endpoint to retrieve the latest data for all instruments

app.get('/api/prices', (req, res) => {

    res.json(latestData);

  });

// a GET endpoint to retrieve the latest tokenMapping for the instruments

  app.get('/api/mappings', (req, res) => {

    res.json(tokenMapping);

  });

// Start the Express server

http.listen(port, () => {

  console.log(`Server listening on port ${port}`);

});
