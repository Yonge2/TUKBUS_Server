const redisClient = require('./redis')
require('dotenv').config()

const DAY_SECOND = 60 * 60 * 24
const MINUTE_10 = 60 * 10
const REFRESH_EX = DAY_SECOND * Number(process.env.RT_EXPIRED_NUMBER)

const authNumKey = (email) => `AUTH_NUMBER:${email}`
const isJoinKey = (email) => `AUTH_JOIN:${email}`
const tokenKey = (email) => `REFRESH:${email}`

const setAuthJoinInRedis = async (email) => {
  const key = isJoinKey(email)
  const result = await redisClient.set(key, 'OK', { EX: MINUTE_10 })
  if (result != 'OK') return false
  return true
}

const getAuthJoinInRedis = async (email) => {
  const key = isJoinKey(email)
  return await redisClient.get(key)
}

const setAuthNumInRedis = async (email, authNum) => {
  const key = authNumKey(email)
  const result = await redisClient.set(key, authNum, { EX: MINUTE_10 })
  if (result != 'OK') return false
  return true
}

const getAuthNumInRedis = async (email) => {
  const key = authNumKey(email)
  return await redisClient.get(key)
}

const setRefreshInReids = async (userId, token) => {
  const key = tokenKey(userId)
  const result = await redisClient.set(key, token, { EX: REFRESH_EX })
  if (result != 'OK') return false
  return true
}

const getRefreshInRedis = async (userId) => {
  const key = tokenKey(userId)
  return await redisClient.get(key)
}
module.exports = {
  setAuthNumInRedis,
  getAuthNumInRedis,
  setAuthJoinInRedis,
  getAuthJoinInRedis,
  setRefreshInReids,
  getRefreshInRedis,
}
