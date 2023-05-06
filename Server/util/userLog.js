const requestIp = require('request-ip');
const dayjs = require('dayjs');
const scheduler = require('node-schedule');

const redisClient = require('../db/redis');
const {redisGetScard} = require('./redisUtil');
const { redisQuery, logQuery } = require('../private/query');
const {setMySQL} = require('../db/conMysql');

let now = new dayjs().format('YYYYMMDD');
let dailyReq = 0;

 //service start
 scheduler.scheduleJob('00 01 00 * * *', async()=>{
    console.log('daily log 초기화');

    let dailyUser = await redisGetScard(redisQuery.userLog(now));
    await setMySQL(logQuery.dailyUser, [now, dailyUser, dailyReq]);
    await redisClient.v4.del(redisQuery.userLog(now));

    setTimeout(()=>{
        now = new dayjs().format('YYYYMMDD');
        dailyReq = 0;
    },1000);
 });

const getLog = async(req)=> {
    if(req.userID){
        await redisClient.sAdd(redisQuery.userLog(now), `${req.userID}`);
        dailyReq += 1;
    }
    else {
        const ip = requestIp.getClientIp(req);
        await redisClient.sAdd(redisQuery.userLog(now), `${ip}`);
        dailyReq += 1;
    }
}

module.exports = {getLog}
