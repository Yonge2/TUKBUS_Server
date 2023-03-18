const express = require('express');
const app = express();
const port = require('../private/privatekey_Tuk').ect;

const server = app.listen(port.socketPort, function(){
    console.log("Socket server has started")
})

const io = require('socket.io')(server);

const chat = require('./socket_util/socketIO');
const {socketJWTMiddleware} = require('./socket_util/socketUtil');



io.of('/chat').use(socketJWTMiddleware);

chat(io);




