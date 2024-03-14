const axios = require('axios')
const { checkMemberInRoom, addMemberInRoom } = require('../redis/redis-util')
const dotenv = require('dotenv')
dotenv.config()

const LIMIT_NUMBER_OF_MEMBER = 3
const AUTH_SERVER_URL = process.env.AUTH_SERVER_URL

const socketIoAuthorization = async (socket, next) => {
  const accessToken = socket.handshake.auth.accessToken
  const roomId = socket.handshake.auth.roomId
  if (!accessToken || !roomId) {
    socket.roomId = null
    socket.errMessage = 'access-token, room-id 확인요망'
    next()
  }

  try {
    const { data } = await axios(AUTH_SERVER_URL, {
      headers: {
        Authorization: accessToken,
      },
    })
    socket.userId = data.user.nickname
    socket.roomId = socket.handshake.auth.roomId

    const numOfmemberInRoom = await checkMemberInRoom(roomId)
    if (numOfmemberInRoom >= LIMIT_NUMBER_OF_MEMBER) {
      socket.roomId = null
      socket.errMessage = '채팅방 인원 초과'
      next()
    }

    const enterUserJob = await addMemberInRoom(roomId, socket.userId)
    socket.firstIn = enterUserJob
    next()
  } catch (err) {
    console.log('socket middleware err : ', err)
    socket.roomId = null
    socket.errMessage = '검증 오류'
    next()
  }
}

module.exports = { socketIoAuthorization }
