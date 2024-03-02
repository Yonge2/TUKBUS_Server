const { createClient } = require('redis')
require('dotenv').config()

const redisClient = createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
})

redisClient.connect().then()

redisClient.on('connect', () => {
  console.info('Redis connected!')
})
redisClient.on('error', (err) => {
  console.error('Redis Client Error', err)
})

module.exports = redisClient
