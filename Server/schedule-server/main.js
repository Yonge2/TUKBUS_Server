const express = require('express');
const PORT = require('../private/privatekey_Tuk').PORT
const scheduleApi = require('./schedule/schedule.router')
const { holidaySchedulerJob, subwaySchedulerJob } = require('./schedule/schedule.batch/schedule.batch.task')
const workObject = require('./schedule/schedule.batch/schedule.batch')

const app = express()

app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use('/api/schedule', scheduleApi)

app.listen(PORT.SCHEDULE_SERVER_PROT, '0.0.0.0', ()=> {
    console.log("Schedule API Server on.")
})

holidaySchedulerJob(workObject).then(()=>{
    subwaySchedulerJob(workObject)
})