const connection = require("../db/conMysql");
const update_schedule = require("../util/editcsv");
const express = require('express');

const router = express.Router();

let sch = [];

//insert data
router.post('/insertWeekday', function(req, res){
    const postsql = 'insert into Bus_Sch_Weekday set ?';
    let resultMs = [];
    let errMs = [];
    sch = update_schedule.sch_weekday_json();

    new Promise((resolve, reject) => {

        for(const i in sch){
            connection.query(postsql, sch[i], function(err, result){
                if(err) {
                    errMs.push(err);
                    reject();
                }
                else{
                    resultMs.push(result);
                    if(i == sch.length-1) resolve();
                }
            });
        }
        
    })
    .then(() => {
        res.status(200);
        res.json({success:true, message:resultMs});
    })
    .catch(() => {
        res.status(500);
        res.json({success:false, message:errMs});
    })
});

router.post('/insertWeekend', function(req, res){
    const postsql = 'insert into Bus_Sch_Weekend set ?';
    let resultMs = [];
    let errMs = [];
    sch = update_schedule.sch_weekend_json();

    new Promise((resolve, reject) => {

        for(const i in sch){
            connection.query(postsql, sch[i], function(err, result){
                if(err) {
                    errMs.push(err);
                    reject();
                }
                else{
                    resultMs.push(result);
                    if(i == sch.length-1) resolve();
                }
            });
        }
        
    })
    .then(() => {
        res.status(200);
        res.json({success:true, message:resultMs});
    })
    .catch(() => {
        res.status(500);
        res.json({success:false, message:errMs});
    })
});



//delete data
router.post('/deleteWeekday', function(req, res){

    let delsql = 'delete from Bus_Sch_Weekday';

    connection.query(delsql, function(err, result){
        if(err) {
            res.status(500);
            res.json({success:false, message:err});
            console.log(err);
        }
        else {
            res.status(200);
            res.json({success:true, message:result});
        }
    });

});

router.post('/deleteWeekend', function(req, res){

    let delsql = 'delete from Bus_Sch_Weekend';

    connection.query(delsql, function(err, result){
        if(err) {
            res.status(500);
            res.json({success:false, message:err});
            console.log(err);
        }
        else {
            res.status(200);
            res.json({success:true, message:result});
        }
    });

});

module.exports = router;