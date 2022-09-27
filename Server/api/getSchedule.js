const connection = require('../db/conMysql');
const sub_request = require('./callMetroSchedule');
const dayFilter = require('../util/dayfilter');
const holiday = require('../util/holiday');

const express = require('express');
const router = express.Router();
const scheduler = require('node-schedule');

let holiday_CODE = 0; //if today is holiday, code = 1, else code =0
let sub_info = [];

scheduler.scheduleJob('00 00 01 * * *', function(){
   let todayObj = holiday.getTodayObj();
   holiday.getHolidays(todayObj.year, todayObj.month).then((holiday_arr)=>{

      //check holiday
      if(holiday_arr.indexOf(todayObj.today) === -1){
         //check time(1h) and update subway data (60sec)
         setInterval( () => {
            dayFilter.dayFilter()
            .then((time) => { //운행중
               setInterval( () => {
                  sub_info = sub_request.getMetro();
               }, 60*1000)
            })
            .catch((err) => { //운행 종료
               sub_info = [];
               console.log(err)
            })
         }, 30*60*1000);
      }
      else { //holiday
         sub_info = [];
         holiday_CODE = 1;
      } 
   }).catch((err) => {
      console.log(err);
   })
})


//to Station, 4set of Bus schedules
router.get('/toStation', (req, res) => {
   if(holiday_CODE === 0){ //not holiday
      dayFilter.dayFilter()
      .then((nowTime) => {
         const getsql_toStation = getSQL("Station", nowTime);
      
         connection.query(getsql_toStation.sql, getsql_toStation.param, function(err, result1){
            if(err){
               res.status(500);
               res.json({success:false, message:err});
               console.log(err);
            }
            else{
               res.status(200);
               res.json({success:true, Bus_schedule:result1, Subway_schedule:sub_info});
               console.log('Success Get');
            }
         });
      })
      .catch((err) => {
         res.status(200);
         res.json({success:true, Bus_schedule:[], Subway_schedule:sub_info, message:'운행종료'});
      });      
   }

   else{
      res.status(200);
      res.json({success:true, Bus_schedule:[], Subway_schedule:sub_info, message:'공휴일'});      
   }
});

//to TUK, 4set of Bus schedules 
router.get('/toTuk', (req, res) =>{
   if(holiday_CODE === 0){ //not holiday
      dayFilter.dayFilter()
      .then((nowTime) => {
         const getsql_toTUK = getSQL("TUK", nowTime);
      
         connection.query(getsql_toTUK.sql, getsql_toTUK.param, function(err, result1){
            if(err){
               res.status(500);
               res.json({success:false, message:err});
               console.log(err);
            }
            else{
               res.status(200);
               res.json({success:true, Bus_schedule:result1, Subway_schedule:sub_info});
               console.log('Success Get');
            }
         });
      })
      .catch((err) => {
         res.status(200);
         res.json({success:true, Bus_schedule:[], Subway_schedule:sub_info, message:'운행종료'});
      });
   }
   else{
      res.status(200);
      res.json({success:true, Bus_schedule:[], Subway_schedule:sub_info, message:'공휴일'}); 
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
            res.status(500);
            res.json({success:false, message:err});
            console.log(err);
         }
         else{
            res.status(200);
            res.json({success:true, Bus_schedule:result});
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
      getsql = 'SELECT * FROM Bus_Sch_Weekend WHERE destination = ? AND day = ? AND(hour >= ? AND min > ? OR hour > ?) LIMIT 4 ;';
      param = [destination, "sat", nowTime.hour, nowTime.min, nowTime.hour];
      getsqlobj.sql = getsql;
      getsqlobj.param = param;
      break;

      case 1 : //saturday
      getsql = 'SELECT * FROM Bus_Sch_Weekend WHERE destination = ? AND(hour >= ? AND min > ? OR hour > ?) LIMIT 4 ;';
      param = [destination, nowTime.hour, nowTime.min, nowTime.hour];
      getsqlobj.sql = getsql;
      getsqlobj.param = param;
      break;

      case 2 : //weekday
      getsql = 'SELECT * FROM Bus_Sch_Weekday WHERE destination = ? AND(hour >= ? AND min > ? OR hour > ?) LIMIT 4 ;';
      param = [destination, nowTime.hour, nowTime.min, nowTime.hour];
      getsqlobj.sql = getsql;
      getsqlobj.param = param;
      break;
   }

   return getsqlobj;
}