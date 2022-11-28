const redisClient = require('../db/redis');

//get array length
const redisGetScard = (key) => {
    return new Promise((resolve, reject)=>{
        redisClient.sCard(key, (err, data)=>{
            if(err) reject(err);
            else resolve(data);
        });
    })
}

//get array data
const redisGetSmembers = (key) => {
    return new Promise((resolve, reject)=>{
        redisClient.sMembers(key, (err, data)=>{
            if(err) reject(err);
            else resolve(data);
        });
    })
}

//delete val in key, success : return 1, fail : return 0
const redisSrem = (key, val) => {
    return new Promise((resolve, reject)=>{
        redisClient.sRem(key, val, (err,data)=>{
            if(err) reject(err);
            else resolve(data);
        })
    })
}

module.exports = {redisGetScard, redisGetSmembers, redisSrem};