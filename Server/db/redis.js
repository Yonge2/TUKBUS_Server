const redis = require('redis');
const redis_private = require('../../../private/privatekey_Tuk').redis_private;

//cloud redis connection (Redislabs)
const redisClient = redis.createClient({
   url: `redis://${redis_private.REDIS_USERNAME}:${redis_private.REDIS_PASSWORD}@${redis_private.REDIS_HOST}:${redis_private.REDIS_PORT}/0`,
   legacyMode: true, // v3포함
});

redisClient.connect().then();

redisClient.on('connect', () => {
   console.info('Redis connected!');
});
redisClient.on('error', (err) => {
   console.error('Redis Client Error', err);
});

module.exports = redisClient