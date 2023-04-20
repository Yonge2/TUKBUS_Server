const express = require('express');
const app = express();
const port = require('../private/privatekey_Tuk').PORT.socketPort;


const server = app.listen(port, function(){
    console.log("Socket server has started")
})

const chat = require('./socket_util/socketIO');
const {socketJWTMiddleware} = require('./socket_util/socketUtil');

const io = require('socket.io')(server);

app.get('/', (req, res)=>{res.send('go')});


io.of('/chat').use(socketJWTMiddleware);

chat(io);