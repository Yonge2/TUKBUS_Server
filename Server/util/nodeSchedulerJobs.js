const {sortingMetro} = require('./callMetroSchedule');
const holiday = require('./holiday');
const dayjs = require('dayjs');


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
    const SUBWAY_intervalGap = 1*60*1000;  //1min

    if(Get_Option_Obj.holiday_CODE){
        Get_Option_Obj.operation_CODE = 1;
        //subway
        Get_Option_Obj.subwayIntervalID = setInterval(async()=>{
            Get_Option_Obj.sub_INFO = await sortingMetro();
        }, SUBWAY_intervalGap);
    }
    else {
        Get_Option_Obj.operation_CODE = 0;
        Get_Option_Obj.sub_INFO = [];
    }
    return Get_Option_Obj;
}

const operation_Stop_schedulerJob = (Get_Option_Obj)=> {
    console.log('service stop(23시)');
    Get_Option_Obj.operation_CODE = 0;
    clearInterval(Get_Option_Obj.subwayIntervalID);
    Get_Option_Obj.sub_INFO = [];
    return Get_Option_Obj;
}

module.exports = {holiday_schedulerJob, operation_Start_schedulerJob, operation_Stop_schedulerJob}