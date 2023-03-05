const express = require('express');
const router = express.Router();
const {getScheduleData, getAllOfScheduleData} = require('./getSchedule');

router.get('/toStation', async(req, res)=>{
    getScheduleData(req, res, 'Station')
});

router.get('/toTuk', async(req, res)=>{
    getScheduleData(req, res, 'TUK')
});

router.get('/all', getAllOfScheduleData);

module.exports = router;
