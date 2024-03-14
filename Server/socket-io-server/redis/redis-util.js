const { redisClient } = require('./redis')

const ROOM_MEMBER = (roomId) => `ROOM_MEMBER:${roomId}`

const addMemberInRoom = async (roomId, nickname) => {
  const roomMemberKey = ROOM_MEMBER(roomId)
  return await redisClient.sAdd(roomMemberKey, nickname)
}

const delMemberInRoom = async (roomId, nickname) => {
  const roomMemberKey = ROOM_MEMBER(roomId)
  return await redisClient.sRem(roomMemberKey, nickname)
}

const checkMemberInRoom = async (roomId) => {
  const roomMemberKey = ROOM_MEMBER(roomId)
  return await redisClient.sCard(roomMemberKey)
}

module.exports = { addMemberInRoom, delMemberInRoom, checkMemberInRoom }
