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

const TUK_Schedule = async(now)=>{
    const hour = now.get('h');
    const min = now.get('m');

    const isStation = await checkSchdule("TUK", "Station", TUK_toStationSch, hour, min);
    const isTUK = await checkSchdule("TUK", "TUK", toTUKsch, hour, min);

    if(now.format('ddd')==='Sat'){
        if(isStation) TUK_toStationSch = await SaturdaySchedule("Station", hour, min);
        if(isTUK) toTUKsch = await SaturdaySchedule("TUK", hour, min);
        return {toTUK: toTUKsch, toStation: TUK_toStationSch};
    }
    else{
        if(isStation) TUK_toStationSch = await shuttleData("TUK", "Station", hour, min);

        //17시 이후
        if(hour>=17 || (hour===16&&min>50)){
            if(isTUK) toTUKsch = await twice_Duration(TUK_toStationSch, 'after17');
            return {toTUK: toTUKsch, toStation: TUK_toStationSch};
        }
        else{ //17시 이전
            if(isTUK) toTUKsch = await shuttleData("TUK", "TUK", hour, min);
            return {toTUK: toTUKsch, toStation: TUK_toStationSch};
        }
    }

}

const GTEC_Schedule = async(now)=>{
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
        return true;
    }
    else return false;
}


const SaturdaySchedule = async(destination, hour, min)=>{
    const saturdayQeury = getScheduleQuery("TUK", destination, hour, min);
    const originSchedule = await getMySQL(saturdayQeury).catch((err)=>{
        console.log('Saturday get sch orr : ', err);
    })
    if(destination==="TUK"){
        //정왕 -> 학교
        if(originSchedule.length){
            const promises = originSchedule.map((ele)=>{
                return addDuration(ele, destination);
            })
            const busSchedule = await Promise.all(promises);
            return busSchedule;
        }
        else return originSchedule;
    }
    else{
        if(originSchedule.length){
            const promises = originSchedule.map((ele)=>{
                return addDuration(ele, 'Sat_Station');
            });
            const cam2Tocam1 = await Promise.all(promises);
            return await twice_Duration(cam2Tocam1, 'Station');
        }
        else return originSchedule;
    }
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

const twice_Duration = async(firstSchedule, destination) =>{
    const promises = firstSchedule.map((ele)=>{
        const tempHour = parseInt(ele.duration.substring(0,2));
        const tempMin = parseInt(ele.duration.substring(3,5));
        
        const tempSch = {
            hour: tempHour,
            min: tempMin,
            destination: destination,
            continuity: false
        }
        return addDuration(tempSch, destination);
    })

    const busSchedule = await Promise.all(promises);
    return busSchedule;
}


const getScheduleQuery = (univName, destination, hour, min) => {
    const now = new dayjs();

    const query = (tableName, destination, hour, min) =>{
        return `SELECT * FROM ${tableName} WHERE destination = ${destination} AND(hour >= ${hour} AND min > ${min} OR hour > ${hour}) ORDER BY hour, min LIMIT 4 ;`;
    }

    if(now.format('ddd')==='Sun') {
        const tableName = 'TUK_Sch_Saturday';
        return query(tableName, `"${destination}"`, hour, min);
    }
    else{
        const tableName = univName==="TUK" ? "TUK_Sch_Weekday" : "GTEC_Sch" ;
        return query(tableName, `"${destination}"`, hour, min);
    }
}