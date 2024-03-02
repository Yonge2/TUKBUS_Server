const { openApi } = require('../../util/util.mod')
const dayjs = require('dayjs')

const SUBWAY_INTERVAL_GAP = 1 * 60 * 1000

const holidaySchedulerJob = async (workObject) => {
  console.log('holiday check')
  const now = new dayjs()
  const [year, month, today] = [now.format('YYYY'), now.format('MM'), now.format('YYYYMMDD')]
  try {
    const holidayResult = await openApi.holiday.getHolidays(year, month)
    const isWeekday = holidayResult.indexOf(today) === -1 ? true : false

    workObject.isWeekday = isWeekday
    return workObject
  } catch (err) {
    console.log(err.message)
    //공휴일이 아닐 날이 많기 때문에 공휴일 필터 오류 시, 운행 가능 하도록
    workObject.isWeekday = true
    return
  }
}

const subwaySchedulerJob = (workObject) => {
  console.log('service start')
  console.log(workObject)
  if (!workObject.isWeekday) {
    console.log('Today is holiday! It is not running')
    workObject.isRunning = false
    return workObject
  }
  workObject.isRunning = true
  //subway
  workObject.subwayIntervalID = setInterval(async () => {
    try {
      const subwayList = await openApi.metro.getMetro(openApi.metro.JEONGWANG_STATION)
      workObject.subwayList = await openApi.metro.sortSubwayList(subwayList)
    } catch (err) {
      console.log('metro err : ', err.message)
      workObject.subwayList = ['지하철 정보를 불러올 수 없습니다. 1분 뒤, 자동으로 다시 불러 오기 요청을 합니다.']
    }
  }, SUBWAY_INTERVAL_GAP)

  return
}

const stopSchedulerJob = (workObject) => {
  console.log('service stop(23시)')
  workObject.isRunning = false
  clearInterval(workObject.subwayIntervalID)
  workObject.subwayList = []
  return
}

module.exports = { holidaySchedulerJob, subwaySchedulerJob, stopSchedulerJob }
