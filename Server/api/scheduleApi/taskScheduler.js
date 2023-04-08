const schedulerJobs = require('../../util/nodeSchedulerJobs');
const scheduler = require('node-schedule');

let Get_Option_Obj = {
    holiday_CODE : 1, //if today is not holiday, code = 1, else code = 0
    operation_CODE : 1, //on : code = 1 / off : code = 0

    sub_INFO : null,
    subwayIntervalID : null,

    TUK_Schedule : {toTUK: [], toStation: []},
    TUK_ScheduleIntervalID : null,

    GTEC_Schedule : {toGTEC: [], toStation: []},
    GTEC_ScheduleIntervalID : null
 }

 module.exports = Get_Option_Obj;

 //check holiday
scheduler.scheduleJob('00 00 01 * * *', ()=>{
    schedulerJobs.holiday_schedulerJob(Get_Option_Obj);
    setTimeout(()=>{
       console.log('not holiday? : ', Get_Option_Obj.holiday_CODE, '\noperation? : ', Get_Option_Obj.operation_CODE);
    },1000);
 });

 //service start
 scheduler.scheduleJob('00 40 16 * * *', ()=>{
    schedulerJobs.operation_Start_schedulerJob(Get_Option_Obj);
    setTimeout(()=>{
       console.log('\noperation? : ', Get_Option_Obj.operation_CODE);
    },1000);
 });

 //service stop
 scheduler.scheduleJob('00 00 23 * * *', ()=>{
    schedulerJobs.operation_Stop_schedulerJob(Get_Option_Obj);
    setTimeout(()=>{
       console.log('\noperation? : ', Get_Option_Obj.operation_CODE);
    },1000);
 });