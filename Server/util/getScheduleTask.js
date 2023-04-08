const dayjs = require('dayjs');
const kakaoDuration = require('./kakaoDuration');
const {getMySQL} = require('../db/conMysql');

//duration 구분
let tempScheduleToTUK = "16:58";

const TUK_Schedule = async()=>{
    const now = new dayjs();
    const hour = now.get('h');
    const min = now.get('m');
    const tempHour = parseInt(tempScheduleToTUK.substring(0,2));
    const tempMin = parseInt(tempScheduleToTUK.substring(3,5));

    const toStationSch = await shuttleData("TUK", "Station", hour, min);
    console.log('getScheduleTask, station : ', toStationSch);

    //17시 이후
    if(hour>=17){
        if(tempHour<=hour && tempMin<=min){
            console.log("duration1:", tempScheduleToTUK);
            const toTUKsch = await shuttleData("TUK", "TUK", hour, min);
            tempScheduleToTUK = toStationSch[0].duration;
            console.log("duration2:", tempScheduleToTUK);
            console.log('getScheduleTask, TUK : ', toTUKsch);

            return {toTUK: toTUKsch, toStation: toStationSch};
        }
        else return {toStation: toStationSch};
    }
    else{
        const toTUKsch = await shuttleData("TUK", "TUK", hour, min);
        return {toTUK: toTUKsch, toStation: toStationSch};
    }
}

const GTEC_Schedule = async()=>{
    const now = new dayjs();
    const hour = now.get('h');
    const min = now.get('m');
    const toGTECsch = await shuttleData("GTEC", "GTEC", hour, min);
    const GTEC_toStationSch = await shuttleData("GTEC", "GTEC_Station", hour, min);

    return {toGTEC: toGTECsch, GTEC_toStation: GTEC_toStationSch};
}

module.exports = {TUK_Schedule, GTEC_Schedule}

//---------------------------------------------------------------//


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

    else if(!originSchedule.length && destination==="TUK"){
        const toStationSchedule = await shuttleData("Station");

        const promises = toStationSchedule.map((ele)=>{
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
    console.log('getScheduleTask, query : ', destination, hour, min);
    //const tableName = univName==="TUK" ? "TUK_Sch" : "GTEC_Sch" ;

    const query = (table, destination, hour, min) =>{
        return `SELECT * FROM ${table} WHERE destination = ${destination} AND(hour >= ${hour} AND min > ${min} OR hour > ${hour}) ORDER BY hour, min LIMIT 4 ;`;
    }

    switch(now.format('ddd')){
       /*case 'Sun' : //sunday 
       return query('Bus_Sch_Weekend', `"${destination}" AND day = "sat&sun"`, hour, min);
 
       case 'Sat' : //saturday
       return query('Bus_Sch_Weekend', `"${destination}"`, hour, min);*/
       
       default : //weekday
       return query("Bus_Sch_Weekday", `"${destination}"`, hour, min);
    }
 }