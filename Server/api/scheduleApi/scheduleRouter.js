const express = require('express');
const router = express.Router();
const {getScheduleData, getAllOfScheduleData} = require('./getSchedule');
const {insertSchedule, deleteSchedule} = require('./editSchedule');

router.get('/toStation', async(req, res)=>{
    getScheduleData(req, res, 'Station')
});

router.get('/toTuk', async(req, res)=>{
    getScheduleData(req, res, 'TUK')
});

router.get('/toGtec', async(req, res)=>{
    getScheduleData(req, res, 'GTEC');
});

router.get('/fromGtecToStation', async(req, res)=>{
    getScheduleData(req, res, 'fromGTECToStation');
})

router.get('/all', getAllOfScheduleData);

router.post('/insert', insertSchedule);
router.post('/delete', deleteSchedule);

module.exports = router;
