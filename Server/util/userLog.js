const requestIp = require('request-ip');
const dayjs = require('dayjs');
const { redisQuery } = require('../private/query');

const getLog = async(req)=> {
    const now = new dayjs().format('YYYYMMDD');
    if(req.userID){
        await redisClient.sAdd(redisQuery.userLog(now), `${req.userID}`);
    }
    else {
        const ip = requestIp.getClientIp(req);
        await redisClient.sAdd(redisQuery.userLog(now), `${ip}`);
    }
}

module.exports = {getLog}
