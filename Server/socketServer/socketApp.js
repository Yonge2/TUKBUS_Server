const express = require('express');

const app = express();
const server = require('http').createServer(app);
const chat = require('./socket');
const io = require('socket.io')(server);

const chat = require('./socket_util/socketIO');
const {socketJWTMiddleware} = require('./socket_util/socketUtil');
const port = require('../../../private/privatekey_Tuk').ect;


io.of('/chat').use(socketJWTMiddleware);

chat(io);


server.listen(port.socketPort, function(){
    console.log("Socket server has started")
})

