const requestIp = require('request-ip');
const dayjs = require('dayjs');
const scheduler = require('node-schedule');

const redisClient = require('../db/redis');
const {redisGetScard} = require('./redisUtil');
const { redisQuery, logQuery } = require('../private/query');
const {setMySQL} = require('../db/conMysql');

let now = new dayjs().format('YYYYMMDD');
let schTuk = 0;
let schGtec = 0;
let settings = 0;
let chat = 0;
let dailyReq = 0;

 //service start
 scheduler.scheduleJob('00 01 00 * * *', async()=>{
    console.log('daily log 초기화');

    let dailyUser = await redisGetScard(redisQuery.userLog(now));
    await setMySQL(logQuery.dailyUser, [now, dailyUser, schTuk, schGtec, settings, chat, dailyReq]);
    await redisClient.v4.del(redisQuery.userLog(now));

    setTimeout(()=>{
        now = new dayjs().format('YYYYMMDD');
        schTuk = 0;
        schGtec = 0;
        settings = 0;
        chat = 0;
        dailyReq = 0;
    },1000);
 });

const getLog = async(req, subject)=> {
    if(req.userID){
        await redisClient.sAdd(redisQuery.userLog(now), `${req.userID}`);
        dailyReq += 1;
        checkReq(subject);
    }
    else {
        const ip = requestIp.getClientIp(req);
        await redisClient.sAdd(redisQuery.userLog(now), `${ip}`);
        dailyReq += 1;
        checkReq(subject);
    }
}

const checkReq = (subject)=>{
    if(subject==='TUK') schTuk += 1;
    else if(subject==='GTEC') schGtec += 1;
    else if(subject==='Settings') settings += 1;
    else if(subject==='chat') chat += 1;
}

module.exports = {getLog}
