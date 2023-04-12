const {getMySQL} = require('../../db/conMysql');
const getOptionOBJ = require('./taskScheduler');
const {TUK_Schedule, GTEC_Schedule} = require('../../util/getScheduleTask')


const getScheduleData = async(req, res, univName, direction)=>{
    //holiday
    if( !getOptionOBJ.holiday_CODE) res.status(200).json({success:true, Bus_schedule:[], 
        Subway_schedule:getOptionOBJ.sub_INFO, message:'공휴일'});

    else{
        //operating time
        if( !getOptionOBJ.operation_CODE) res.status(200).json({success:true, Bus_schedule:[], 
            Subway_schedule:getOptionOBJ.sub_INFO, message:'운행종료'});

        else{
            const Bus_schedule = await schClassification(univName, direction);
            res.status(200).json({success: true, Bus_schedule: Bus_schedule,
                 Subway_schedule: getOptionOBJ.sub_INFO});
        }
    }
}


const getAllOfScheduleData = async(req, res) =>{
    const query = allOfScheduleQuery(req);
    const data = await getMySQL(query).catch((e)=>{
        console.log('allOfSchedule get err: ',e);
        res.status(200).json({success: false, message: '쿼리오류'});
    });
    res.status(200).json({
        success:true, Bus_schedule: data
    })
}


module.exports = {getScheduleData, getAllOfScheduleData};


const schClassification = (univName, direction) =>{
    return new Promise(async(resolve, reject)=>{
        const sch = (univName==="TUK")? await TUK_Schedule() : await GTEC_Schedule();
        const destination = 
        (univName==="GTEC"&&direction==="Station") ? "GTEC_Station" : direction;
        switch(destination){
            case 'TUK':
                resolve(sch.toTUK);
                break;
            case 'Station':
                resolve(sch.toStation);
                break;
            case 'GTEC_Station':
                resolve(sch.toStation);
                break;
            case 'GTEC':
                resolve(sch.toGTEC);
                break;
        }
    })
}


const allOfScheduleQuery = (req)=>{
    const query =(day)=>{
        return `SELECT * FROM ${day} ORDER BY destination, hour, min;`;
    }
    if(req.query.univName==="TUK") return query('Bus_Sch_Weekday');
    else if(req.query.univName==="GTEC") return query('GTEC_Sch');
}