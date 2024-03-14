const express = require('express')
const { chatting } = require('./socket.io/socket-io')
const { socketIoAuthorization } = require('./socket.io/socket-io.authorization')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const server = app.listen(process.env.SOCKET_IO_SERVER_PORT, () => {
  console.log('socket-io server on')
})

const io = require('socket.io')(server)
io.of('/sockets').use(socketIoAuthorization)

chatting(io)
