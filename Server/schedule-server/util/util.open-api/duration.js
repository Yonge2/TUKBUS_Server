const axios = require('axios')
const dayjs = require('dayjs')
require('dotenv').config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})
const { kakaoApi } = require('../../../private/privatekey_Tuk')

/**
 * originSchedule  = {destination: TUK|GTEC, time: HH:mm, continuity: boolean}
 * 원래 시간표에 duration을 붙여서 반환한다.
 */
const addDuration = async (schedule) => {
  schedule.time = schedule.duration ? schedule.duration : schedule.time
  const [hour, min] = schedule.duration ? schedule.duration.split(':') : schedule.time.split(':')
  try {
    const result = await getDuration(schedule.destination, hour, min)
    //요청 시간에 duration-result(second)를 더하여 HH:mm의 형태로 변환
    const duration = dayjs().set('hour', hour).set('minute', min).add(result, 'second').format('HH:mm')
    return {
      ...schedule,
      duration,
    }
  } catch (e) {
    console.log('Add Duration err : ', e.message)
    return { message: 'Kakao Api err' }
  }
}

/**
 * KakaoNavi로부터 목적지까지의 예상소요 초를 받아올 수 있다.
 * @param {'TUK'|'GTEC'|'Station'|'after17'} direction
 * @param {'HH'} hour
 * @param {'mm'} min
 * @returns {number}duration(second)
 */
const getDuration = async (direction, hour, min) => {
  const currentDate = new dayjs().format('YYYYMMDD') + hour + min
  const url = kakaoApi.setFutureRouteSearchParams(direction, currentDate)
  try {
    const kakaoNaviData = await axios(url, { headers: { Authorization: process.env.KAKAO_AUTH } })
    const duration = kakaoNaviData.data.routes[0].summary.duration
    return duration
  } catch (err) {
    console.log('kakao Navi Axios err : ', err.message)
    return { message: 'kakao Navi Axios err' }
  }
}

module.exports = { addDuration }
