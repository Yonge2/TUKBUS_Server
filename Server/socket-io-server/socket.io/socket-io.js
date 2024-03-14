const chatting = (io) => {
  const chat = io.of('/sockets').on('connection', async (socket) => {
    if (socket.errMessage) {
      socket.emit('checkErr', socket.errMessage)
      return
    }
    socket.join(socket.roomId)

    if (socket.firstIn) {
      chat.to(socket.nickname).emit('in', socket.nickname)
    }

    socket.on('chat message', (data) => {
      data.roomId = socket.roomId
      data.nickname = socket.nickname

      chat.to(socket.roomId).emit('chat message', {
        nickname: data.nickname,
        message: data.message,
        time: data.time,
      })
    })
  })
}

module.exports = { chatting }
