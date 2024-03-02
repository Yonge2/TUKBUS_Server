const dayjs = require('dayjs')
const {
  getAllSchedule,
  getSchedule,
  getMoreSchedule,
  getAfter17Schedule,
  getIsValidQuery,
} = require('./schedule.data/schedule.get.data')
const { openApi } = require('../util/util.mod')
const { setScheduleInRedis, getScheduleInRedis } = require('../redis/redis-util')
const workObject = require('./schedule.batch/schedule.batch')

//work flow
//[동작여부확인] -> [유효성 검사] -> [DB GET] -> [DB기반 kakao navi를 통한 시간표 데이터 생성] -> [지하철정보와 함께 반환]
const getScheduleService = async (req, res) => {
  if (!workObject.isRunning) {
    res.res.status(200).json({ message: '셔틀 없는 날' })
  }
  const [univName, destination] = [req.query.univName, req.query.destination]

  if (!univName || !destination) {
    return res.status(400).json({ message: '잘못된 쿼리 요청' })
  }
  const [isValidQuery] = await getIsValidQuery(univName, destination)
  if (!isValidQuery.isValidQuery) {
    return res.status(400).json({ message: '잘못된 쿼리 요청' })
  }
  //schedules
  //캐시 확인 -> 캐시 데이터 변경 필요 여부 (필요 없으면 캐시 반환) -> 시간표 데이터 생성, 캐싱 후 반환
  try {
    const cachedSchedule = await getScheduleInRedis(univName, destination)
    if (cachedSchedule) {
      const isChange = isScheduleChanged(cachedSchedule)
      if (!isChange) {
        return res.status(200).json({ schdule: cachedSchedule, subway: workObject.subwayList })
      }
    }
    const schedule = await createSchedule(univName, destination)

    await setScheduleInRedis(univName, destination, schedule)

    if (!schedule.length) {
      return res.status(404).json({ message: '금일 운행종료' })
    }
    return res.status(200).json({ schdule: schedule, subway: workObject.subwayList })
  } catch (e) {
    console.log(e)
    return res.status(404).json({ message: '시간표를 불러올 수 없습니다.' })
  }
}

const getAllScheduleService = async (req, res) => {
  const univName = req.query.univName
  if (!univName) {
    return res.status(400).json({ message: 'No univName' })
  }
  const [isValidQuery] = await getIsValidQuery(univName, '')
  if (!isValidQuery.isValidQuery) {
    return res.status(400).json({ message: '잘못된 쿼리 요청' })
  }
  //all Schedule
  if (!destination) {
    const schedule = await getAllSchedule(univName)
    if (!schedule.length) {
      return res.status(404).json({ message: 'Not Found Schedule' })
    }
    return res.status(200).json({ schedule })
  }
}

module.exports = { getScheduleService, getAllScheduleService }

/**
 * DB 조회 -> DB데이터 기반 시간표 데이터 생성
 */
const createSchedule = async (univName, destination) => {
  const schedule = []
  const NOMAL_LENGTH = 4

  const originSchedules = await getSchedule(univName, destination)
  const addDurationJob = originSchedules.map((originSchedule) => {
    return openApi.duration.addDuration(originSchedule)
  })

  schedule.push(...(await Promise.all(addDurationJob)))
  const scheduleLen = schedule.length

  //17시 이후, TUK, 등교 시, 하교 시간표를 이용한 데이터 생성
  if (scheduleLen < NOMAL_LENGTH && univName === 'TUK' && destination === 'TUK') {
    let toStationSchedules = []

    //등교 시간표가 1개 이상 3개 이하일 때 부족한 갯수 만큼만 생성
    if (scheduleLen) {
      const neededNumber = NOMAL_LENGTH - originSchedules.length
      const standardTime = originSchedules.at(-1).time
      toStationSchedules = await getMoreSchedule(univName, standardTime, neededNumber)
    }
    //등교 시간표 0개 일 때.
    else {
      //17시 이후, 등교 case만 특이한 것이기 때문에 query에 매개변수가 필요하지 않음
      toStationSchedules = await getAfter17Schedule()
      //과거 시간으로 생성된 데이터가 유효한지 테스트, 유효하지 않을 경우 현재 시간으로 재생성
      const testDuration = await openApi.duration.addDuration(toStationSchedules[0])
      const now = dayjs().format('HH:mm')
      if (testDuration.duration < now) {
        destination = 'STATION'
        toStationSchedules = await getSchedule(univName, destination)
      }
    }

    const after17Destination = 'AFTER17'
    const addDurationJob = toStationSchedules.map(async (toStationSchedule) => {
      const addFirst = await openApi.duration.addDuration(toStationSchedule)
      addFirst.time = addFirst.duration
      addFirst.destination = after17Destination
      const { duration, ...secondVal } = addFirst
      const addSecond = await openApi.duration.addDuration(secondVal)
      return addSecond
    })

    schedule.push(...(await Promise.all(addDurationJob)))
  }
  return schedule
}

const isScheduleChanged = (scheduleInRedis) => {
  if (!scheduleInRedis) {
    return true
  }
  const now = new dayjs().format('HH:mm')
  const scheduleTime = scheduleInRedis[0].time
  if (now > scheduleTime) {
    return true
  }
  return false
}
