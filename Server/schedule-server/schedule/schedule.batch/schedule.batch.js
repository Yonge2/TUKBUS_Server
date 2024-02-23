const scheduler = require('node-schedule')
const { holidaySchedulerJob, stopSchedulerJob, subwaySchedulerJob } = require('./schedule.batch.task')

/**
 * Batch 작업의 결과물 Object
 * 
 * {isWeekday: boolean (평일-true) / 공휴일-false) 구분)
 * isRunning: boolean (운행중-true / 운행종료-false)
 * subwayList: any[] (실시간 지하철 정보)
 * subwayIntervalID: any (실시간 지하철 정보 setInterval ID)}
 */
const workObject = {
    isWeekday : null, //if today is not holiday, code = 1, else code = 0
    isRunning : false, //on : code = 1 / off : code = 0
    subwayList : [],
    subwayIntervalID : null,
 }

 module.exports = workObject

  //check holiday
scheduler.scheduleJob('00 00 01 * * *', ()=>{
   console.log('01:00 holiday check')
   holidaySchedulerJob(workObject);
 })

 //service start
 scheduler.scheduleJob('00 00 08 * * *', ()=>{
   console.log('08:00 subway service check')
   subwaySchedulerJob(workObject)
 })

 //service stop
 scheduler.scheduleJob('00 00 23 * * *', ()=>{
   console.log('23:00 service down')
   stopSchedulerJob(workObject)
 })
 