const dayjs = require('dayjs');
const scheduler = require('node-schedule');
const kakaoDuration = require('./kakaoDuration');
const {getMySQL} = require('../db/conMysql');

let toTUKsch = [];
let TUK_toStationSch = [];
let toGTECsch = [];
let GTEC_toStationSch = [];

scheduler.scheduleJob('00 00 01 * * *', ()=>{
    TUK_toStationSch = [];
    toTUKsch = [];
    toGTECsch = [];
    GTEC_toStationSch = [];
});

const TUK_Schedule = async()=>{
    const now = new dayjs();
    const hour = now.get('h');
    const min = now.get('m');
    
    const isStation = await checkSchdule("TUK", "Station", TUK_toStationSch, hour, min);
    const isTUK = await checkSchdule("TUK", "TUK", toTUKsch, hour, min);

    if(isStation) TUK_toStationSch = await shuttleData("TUK", "Station", hour, min);

    //17시 이후
    if(hour>=17 || (hour===16&&min>50)){
        if(isTUK) toTUKsch = await after17_TUK_ShuttleData(TUK_toStationSch);
        return {toTUK: toTUKsch, toStation: TUK_toStationSch};
    }
    else{ //17시 이전
        if(isTUK) toTUKsch = await shuttleData("TUK", "TUK", hour, min);
        return {toTUK: toTUKsch, toStation: TUK_toStationSch};
    }
}

const GTEC_Schedule = async()=>{
    const now = new dayjs();
    const hour = now.get('h');
    const min = now.get('m');

    const isGTEC = await checkSchdule("GTEC", "GTEC", toGTECsch, hour, min);
    const isStation = await checkSchdule("GTEC", "Station", GTEC_toStationSch, hour, min);

    if(isGTEC) toGTECsch = await shuttleData("GTEC", "GTEC", hour, min); 
    if(isStation) GTEC_toStationSch = await shuttleData("GTEC", "Station", hour, min);

    return {toGTEC: toGTECsch, toStation: GTEC_toStationSch};
}

module.exports = {TUK_Schedule, GTEC_Schedule}

//---------------------------------------------------------------//

const checkSchdule = async(univName, destination, schArray, nowHour, nowMin) =>{
    let schTime = "00:00";
    
    if(schArray.length&&univName==="TUK"){
        schTime = (destination==="TUK") ? schArray[0].time : schArray[0].time ;
    }
    else if(schArray.length&&univName==="GTEC"){
        schTime = (destination==="GTEC") ? schArray[0].time : schArray[0].time ;
    }
    const schHour = parseInt(schTime.substring(0,2));
    const schMin = parseInt(schTime.substring(3,5));

    if(nowHour>schHour || (nowHour>=schHour&&nowMin>schMin)) {
        console.log("바뀜", schTime);
        return true;
    }
    else return false;
}

const after17_TUK_ShuttleData = async(stationSchedule) =>{
    const promises = stationSchedule.map((ele)=>{
        const tempHour = parseInt(ele.duration.substring(0,2));
        const tempMin = parseInt(ele.duration.substring(3,5));
        
        const tempSch = {
            hour: tempHour,
            min: tempMin,
            destination: 'after17',
            continuity: false
        }
        return addDuration(tempSch, 'after17');
    })

    const busSchedule = await Promise.all(promises);
    return busSchedule;
}


const shuttleData = async(univName, destination, hour, min)=>{
    let direction = (univName==="GTEC"&&destination==="Station")? "GTEC_Station" : destination;

    const query = getScheduleQuery(univName, destination, hour, min);
    const originSchedule = await getMySQL(query).catch((e)=>{
        console.log("get Schedule err: ",e);
    });

    if(originSchedule.length){
        const promises = originSchedule.map((ele)=>{
            return addDuration(ele, direction);
        })
        const busSchedule = await Promise.all(promises);
        return busSchedule;
    }
    else return originSchedule;
}


const addDuration = (element, direction) => {
    return new Promise(async(resolve, reject)=>{

        const schTime = dayjs().set('hour', element.hour).set('minute', element.min);
        const hour = schTime.format('HH');
        const min = schTime.format('mm');

        const duration = await kakaoDuration(direction, hour, min).catch((e)=>{
            reject(e);
            console.log('kakao Api err : ', e);
        });
        resolve({
            destination: element.destination,
            time: schTime.format('HH:mm'),
            duration : schTime.add(duration, 'second').format('HH:mm'),
            continuity: element.continuity
        });
    })
}


const getScheduleQuery = (univName, destination, hour, min) => {
    const now = new dayjs();
    const tableName = univName==="TUK" ? "Bus_Sch_Weekday" : "gtec_sch" ;

    const query = (table, destination, hour, min) =>{
        return `SELECT * FROM ${table} WHERE destination = ${destination} AND(hour >= ${hour} AND min > ${min} OR hour > ${hour}) ORDER BY hour, min LIMIT 4 ;`;
    }

    switch(now.format('ddd')){
       /*case 'Sun' : //sunday 
       return query('Bus_Sch_Weekend', `"${destination}" AND day = "sat&sun"`, hour, min);
 
       case 'Sat' : //saturday
       return query('Bus_Sch_Weekend', `"${destination}"`, hour, min);*/
       
       default : //weekday
       return query(tableName, `"${destination}"`, hour, min);
    }
 }