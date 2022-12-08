const redisClient = require('../db/redis');

/**
 * get length of SET
 * @param {String} key 
 * @returns {Promise<Integer>} length
 */
const redisGetScard = (key) => {
    return new Promise((resolve, reject)=>{
        redisClient.sCard(key, (err, data)=>{
            if(err) reject(err);
            else resolve(data);
        });

    })
}

/**
 * get array inChatroomMembers
 * @param {String} key 
 * @returns {Promise<String[]>} inChatroomMembers
 */
const redisGetSmembers = (key) => {
    return new Promise((resolve, reject)=>{
        redisClient.sMembers(key, (err, data)=>{
            if(err) reject(err);
            else resolve(data);
        });
    })
}

/**
 * delete key
 * @param {String} key 
 * @returns {Promise<Integer>} success_1 fail_0
 */
const redisSrem = (key, val) => {
    return new Promise((resolve, reject)=>{
        redisClient.sRem(key, val, (err,data)=>{
            if(err) reject(err);
            else resolve(data);
        })
    })
}

module.exports = {redisGetScard, redisGetSmembers, redisSrem};