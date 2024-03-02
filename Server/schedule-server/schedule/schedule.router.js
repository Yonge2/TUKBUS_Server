const express = require('express')
const { getScheduleService, getAllScheduleService } = require('./schedule.get.service')
const { setScheduleService, delScheduleService } = require('./schedule.set.service')
const router = express.Router()

router.get('/', async (req, res) => await getScheduleService(req, res))

router.get('/all', async (req, res) => await getAllScheduleService(req, res))

//관리자 권한 삽입 예정
router.post('/', async (req, res) => await setScheduleService(req, res))

//관리자 권한 삽입 예정
router.delete('/', async (req, res) => await delScheduleService(req, res))

module.exports = router
