const redisClient = require('./redis')
const tokenEX = require('../../private/privatekey_Tuk').jwt.refreshTokenExByNumber

const authNumKey = (email) => `AUTH_NUMBER:${email}`
const isJoinKey = (email) => `AUTH_JOIN:${email}`
const tokenKey = (email) => `REFRESH:${email}`
const tenMinute = 60 * 10

const setAuthJoinInRedis = async (email) => {
  const key = isJoinKey(email)
  const result = await redisClient.set(key, 'OK', { EX: tenMinute })
  if (result != 'OK') return false
  return true
}

const getAuthJoinInRedis = async (email) => {
  const key = isJoinKey(email)
  return await redisClient.get(key)
}

const setAuthNumInRedis = async (email, authNum) => {
  const key = authNumKey(email)
  const result = await redisClient.set(key, authNum, { EX: tenMinute })
  if (result != 'OK') return false
  return true
}

const getAuthNumInRedis = async (email) => {
  const key = authNumKey(email)
  return await redisClient.get(key)
}

const setRefreshInReids = async (email, token) => {
  const key = tokenKey(email)
  const result = await redisClient.set(key, token, { EX: tokenEX })
  if (result != 'OK') return false
  return true
}

const getRefreshInRedis = async (email) => {
  const key = tokenKey(email)
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
