const express = require('express');
const app = express();
const port = require('../private/privatekey_Tuk').PORT.socketPort;

app.get('/', ()=>{res.send('go')});
const server = app.listen(port.socketPort, function(){
    console.log("Socket server has started")
})

const chat = require('./socket_util/socketIO');
const {socketJWTMiddleware} = require('./socket_util/socketUtil');
const io = require('socket.io')(server);


io.of('/chat').use(socketJWTMiddleware);

chat(io);





