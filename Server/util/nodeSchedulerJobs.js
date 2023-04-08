const sub_request = require('./callMetroSchedule');
const holiday = require('./holiday');
const dayjs = require('dayjs');
const {TUK_Schedule, GTEC_Schedule} = require('./getScheduleTask');


const holiday_schedulerJob = async(Get_Option_Obj)=> {
    console.log('holiday check (1시)');
    const today = new dayjs();

    try{
        const holiday_result = await holiday(today.format('YYYY'), today.format('MM'));
        if(holiday_result.indexOf(today.format('YYYYMMDD')) === -1){
            Get_Option_Obj.holiday_CODE = 1;
            console.log('Today is not holiday');
           }
            //holiday
        else {
            Get_Option_Obj.holiday_CODE = 0;
            console.log('Today is holiday');
        }        
    }
    catch(err){
        if(Array.isArray(err) && err.length ===0){ // case : err == []
            console.log('There is no holiday this month');
            Get_Option_Obj.holiday_CODE = 1;
        }
        else {
            console.log('holiday err : ', err);
            Get_Option_Obj.holiday_CODE = 1;
        }
    }
    return Get_Option_Obj;
}

const operation_Start_schedulerJob = (Get_Option_Obj)=> {
    console.log('service start(8시)');
    const SUBWAY_intervalGap = 1*60*1000;
    let TUK_intervalGap = 5*60*1000; //5min
    let GTEC_intervalGap = 1*60*1000; //1min

    if(Get_Option_Obj.holiday_CODE){
        Get_Option_Obj.operation_CODE = 1;

        //subway
        Get_Option_Obj.subwayIntervalID = setInterval(async()=>{
            Get_Option_Obj.sub_INFO = await sub_request();
        }, SUBWAY_intervalGap);

        //tuk : 17시까진 5분에 한 번, 이후에는 1분에 한 번
        //gtec : 11시까진 1분에 한번, 이후에는 5분에 한 번
        //schedule
        Get_Option_Obj.TUK_IntervalID = setInterval(async()=>{
            if(dayjs().get('h')>=17) TUK_intervalGap = 1*60*1000;
            Get_Option_Obj.TUK_Schedule = await TUK_Schedule();
        }, TUK_intervalGap)

        /*Get_Option_Obj.GTEC_IntervalID = setInterval(async()=>{
            if(dayjs().get('h')>=11||(dayjs().get('h')===10&&dayjs().get('m')>58)) GTEC_intervalGap = 5*60*1000;
            Get_Option_Obj.GTEC_Schedule = GTEC_Schedule();
        }, GTEC_intervalGap)*/
    }
    else {
        Get_Option_Obj.operation_CODE = 0;
        Get_Option_Obj.sub_INFO = [];
        Get_Option_Obj.TUK_Schedule = {};
        Get_Option_Obj.GTEC_Schedule = {};
    }
    return Get_Option_Obj;
}

const operation_Stop_schedulerJob = (Get_Option_Obj)=> {
    console.log('service stop(23시)');
    Get_Option_Obj.operation_CODE = 0;
    clearInterval(Get_Option_Obj.subwayIntervalID);
    clearInterval(Get_Option_Obj.TUK_IntervalID);
    //clearInterval(Get_Option_Obj.GTEC_IntervalID);
    Get_Option_Obj.sub_INFO = [];
    Get_Option_Obj.TUK_Schedule = {};
    Get_Option_Obj.GTEC_Schedule = {};
    return Get_Option_Obj;
}

module.exports = {holiday_schedulerJob, operation_Start_schedulerJob, operation_Stop_schedulerJob}