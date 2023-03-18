const kakaoDuration = require('../../util/kakaoDuration');
const dayjs = require('dayjs');
const {getMySQL} = require('../../db/conMysql');
const getOptionOBJ = require('./taskScheduler');


const getScheduleData = async(req, res, direction)=>{
    //holiday
    if( !getOptionOBJ.holiday_CODE) res.status(200).json({success:true, Bus_schedule:[], 
        Subway_schedule:getOptionOBJ.sub_INFO, message:'공휴일'});

    else{
        //operating time
        if( !getOptionOBJ.operation_CODE) res.status(200).json({success:true, Bus_schedule:[], 
            Subway_schedule:getOptionOBJ.sub_INFO, message:'운행종료'});

        else{
            const shuttledata = await shuttleData(direction).catch((e)=>{
                console.log('shuttleData err: ', e);
                res.status(200).json({success: false, message: e});
            });
            res.status(200).json({success: true, Bus_schedule: shuttledata, Subway_schedule: getOptionOBJ.sub_INFO});
        }
    }
}

const getAllOfScheduleData = async(req, res) =>{
    const query = allOfScheduleQuery(req);
    const data = await getMySQL(query).catch((e)=>{
        console.log('allOfSchedule get err: ',e);
        res.status(204).json({success: false, message: e});
    });
    res.status(200).json({
        success:true, Bus_schedule: data
    })
}

module.exports = {getScheduleData, getAllOfScheduleData};




const shuttleData = async(direction)=>{
    const query = getScheduleQuery(direction);
    try{
        const originSchedule = await getMySQL(query);

        if(originSchedule.length){
            //promise 병렬처리
            const promises = originSchedule.map((ele)=>{
                return addDuration(ele, direction);
            })
            const busSchedule = await Promise.all(promises);
            return busSchedule;
        }

        else return originSchedule;
    }
    catch(e){
        console.log(e);
    }
}

const addDuration = (element, direction) => {
    return new Promise(async(resolve, reject)=>{

        const schTime = dayjs().set('hour', element.hour).set('minute', element.min);
        const hour = schTime.format('HH');
        const min = schTime.format('mm');
        try{
            const duration = await kakaoDuration(direction, hour, min);
            resolve({
                seq: element.seq,
                time: schTime.format('HH:mm'),
                destination: element.destination,
                duration : schTime.add(duration, 'second').format('HH:mm')
            });
        }
        catch(e){
            reject(e);
            console.log('kakao Api err : ', e);
        }
    })
}


const allOfScheduleQuery = (req)=>{
    const query =(day)=>{
        return `SELECT * FROM ${day} ORDER BY destination, hour, min;`;
    }
    switch(req.query.day){
        case 'sunday': 
            return query('Bus_Sch_Weekend WHERE day = "sat&sun"');
        case 'saturday':
            return query('Bus_Sch_Weekend');
        case 'weekday':
            return query('Bus_Sch_Weekday WHERE continuity != "y"');
    }
}

const getScheduleQuery = (destination) => {

    const query = (table, destination, hour, min) =>{
        return `SELECT * FROM ${table} WHERE destination = ${destination} AND(hour >= ${hour} AND min > ${min} OR hour > ${hour}) ORDER BY hour, min LIMIT 4 ;`;
    }

    const now = new dayjs();
    const hour = now.get('h');
    const min = now.get('m');

    switch(now.format('ddd')){
       case 'Sun' : //sunday 
       return query('Bus_Sch_Weekend', `"${destination}" AND day = "sat&sun"`, hour, min);
 
       case 'Sat' : //saturday
       return query('Bus_Sch_Weekend', `"${destination}"`, hour, min);
       
       default : //weekday
       return query('Bus_Sch_Weekday', `"${destination}"`, hour, min);
    }
 }
