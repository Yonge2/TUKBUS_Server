const express = require('express')
const scheduleApi = require('./schedule/schedule.router')
const { holidaySchedulerJob, subwaySchedulerJob } = require('./schedule/schedule.batch/schedule.batch.task')
const workObject = require('./schedule/schedule.batch/schedule.batch')
require('dotenv').config()

const app = express()

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/api/schedule', scheduleApi)

app.listen(process.env.SCHEDULE_SERVER_PROT, '0.0.0.0', () => {
  console.log('Schedule API Server on.')
})

holidaySchedulerJob(workObject).then(() => {
  subwaySchedulerJob(workObject)
})
