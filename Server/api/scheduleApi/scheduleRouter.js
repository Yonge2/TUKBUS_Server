const express = require('express');
const router = express.Router();
const {getScheduleData, getAllOfScheduleData} = require('./getSchedule');
const {insertSchedule, deleteSchedule} = require('./editSchedule');
const {getLog} = require('../../util/userLog');

router.get('/toStation', async(req, res)=>{
    getScheduleData(req, res, 'TUK', 'Station');
    getLog(req, 'TUK');
});

router.get('/toTuk', async(req, res)=>{
    getScheduleData(req, res, 'TUK', 'TUK');
    getLog(req, 'TUK');
});

router.get('/toGtec', async(req, res)=>{
    getScheduleData(req, res, 'GTEC', 'GTEC');
    getLog(req, 'GTEC');
});

router.get('/fromGtecToStation', async(req, res)=>{
    getScheduleData(req, res, 'GTEC', 'Station');
    getLog(req, 'GTEC');
})

router.get('/all', async(req, res)=>{
    getAllOfScheduleData(req, res);
    getLog(req);
})

router.post('/insert', insertSchedule);
router.post('/delete', deleteSchedule);

module.exports = router;