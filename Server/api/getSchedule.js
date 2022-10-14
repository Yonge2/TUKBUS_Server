const connection = require('../db/conMysql');
const dayFilter = require('../util/dayfilter');
const schedulerJobs = require('../util/nodeSchedulerJobs');

const express = require('express');
const router = express.Router();
const scheduler = require('node-schedule');

let Get_Option_Obj = {
   holiday_CODE : null, //if today is not holiday, code = 1, else code = 0
   operation_CODE : null, //on : code = 1 / off : code = 0
   sub_INFO : null,
   intervalID : null
}

//check holiday
scheduler.scheduleJob('00 00 01 * * *', ()=>{
   schedulerJobs.holiday_schedulerJob(Get_Option_Obj);
   console.log(Get_Option_Obj);
});
//service start
scheduler.scheduleJob('00 00 08 * * *', ()=>{
   schedulerJobs.operation_Start_schedulerJob(Get_Option_Obj);
   console.log(Get_Option_Obj);
});
//service stop
scheduler.scheduleJob('00 00 23 * * *', ()=>{
   schedulerJobs.operation_Stop_schedulerJob(Get_Option_Obj);
   console.log(Get_Option_Obj);
});


//to Station, 4set of Bus schedules
router.get('/toStation', (req, res) => {
   if(Get_Option_Obj.holiday_CODE){ //not holiday
      dayFilter.dayFilter(Get_Option_Obj.operation_CODE)
      .then((nowTime) => {
         const getsql_toStation = getSQL("Station", nowTime);
      
         connection.query(getsql_toStation.sql, getsql_toStation.param, function(err, result){
            if(err){
               res.status(500).json({success:false, message:err});
               console.log(err);
            }
            else{
               res.status(200).json({success:true, Bus_schedule:result,
                  Subway_schedule:Get_Option_Obj.sub_INFO});
               console.log('Success Get');
            }
         });
      })
      .catch((err) => {
         res.status(200).json({success:true, Bus_schedule:[],
            Subway_schedule:Get_Option_Obj.sub_INFO, message:err});
      });      
   }

   else{
      res.status(200).json({success:true, Bus_schedule:[], 
         Subway_schedule:Get_Option_Obj.sub_INFO, message:'공휴일'});
   }
});

//to TUK, 4set of Bus schedules 
router.get('/toTuk', (req, res) =>{
   if(Get_Option_Obj.holiday_CODE){ //not holiday
      dayFilter.dayFilter(Get_Option_Obj.operation_CODE)
      .then((nowTime) => {
         const getsql_toTUK = getSQL("TUK", nowTime);
      
         connection.query(getsql_toTUK.sql, getsql_toTUK.param, function(err, result){
            if(err){
               res.status(500).json({success:false, message:err});
               console.log(err);
            }
            else{
               res.status(200).json({success:true, Bus_schedule:result,
                  Subway_schedule:Get_Option_Obj.sub_INFO});
               console.log('Success Get');
            }
         });
      })
      .catch((err) => {
         res.status(200).json({success:true, Bus_schedule:[],
            Subway_schedule:Get_Option_Obj.sub_INFO, message:err});
      });
   }
   else{
      res.status(200).json({success:true, Bus_schedule:[],
         Subway_schedule:Get_Option_Obj.sub_INFO, message:'공휴일'}); 
   }
});


//All schedules
router.get('/all', (req, res) => {
   new Promise((resolve, reject) => {
      let getsql = '';
      switch(req.query.day){
         case 'sunday' : 
         getsql = 'SELECT * FROM Bus_Sch_Weekend WHERE day = "sat&sun" ORDER BY destination, hour, min;';
         resolve(getsql);
         break;

         case 'saturday' : 
         getsql = 'SELECT * FROM Bus_Sch_Weekend ORDER BY destination, hour, min;';
         resolve(getsql);
         break;

         case 'weekday' : 
         getsql = 'SELECT * FROM Bus_Sch_Weekday WHERE continuity != "y" ORDER BY destination, hour, min;';
         resolve(getsql);
         break;

         default:
            reject('query err')
            break;
      }
   })
   .then((getsql) => {
      connection.query(getsql, function(err, result) {
         if (err) 
         {
            res.status(500).json({success:false, message:err});
            console.log(err);
         }
         else{
            res.status(200).json({success:true, Bus_schedule:result});
            console.log('Success Get');
         }
      });
   })
   .catch((err) => {
      res.send(err);
   })
});

module.exports = router;



function getSQL(destination, nowTime){

   let getsql = '';
   let param = [];
   const getsqlobj = {};

   switch(nowTime.day){
      case 0 : //sunday 
      getsql = 'SELECT * FROM Bus_Sch_Weekend WHERE destination = ? AND day = ? AND(hour >= ? AND min > ? OR hour > ?) ORDER BY hour LIMIT 4 ;';
      param = [destination, "sat&sun", nowTime.hour, nowTime.min, nowTime.hour];
      getsqlobj.sql = getsql;
      getsqlobj.param = param;
      break;

      case 1 : //saturday
      getsql = 'SELECT * FROM Bus_Sch_Weekend WHERE destination = ? AND(hour >= ? AND min > ? OR hour > ?) ORDER BY hour LIMIT 4 ;';
      param = [destination, nowTime.hour, nowTime.min, nowTime.hour];
      getsqlobj.sql = getsql;
      getsqlobj.param = param;
      break;

      case 2 : //weekday
      getsql = 'SELECT * FROM Bus_Sch_Weekday WHERE destination = ? AND(hour >= ? AND min > ? OR hour > ?) ORDER BY hour LIMIT 4 ;';
      param = [destination, nowTime.hour, nowTime.min, nowTime.hour];
      getsqlobj.sql = getsql;
      getsqlobj.param = param;
      break;
   }

   return getsqlobj;
}