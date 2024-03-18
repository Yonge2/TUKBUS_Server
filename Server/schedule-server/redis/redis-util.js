const { redisClient } = require('./redis')

const scheduleKey = (univeName, destination) => `SCHEDULE:${univeName}_${destination}`
const CACHE_EX = 60 * 60

const getScheduleInRedis = async (univeName, destination) => {
  const key = scheduleKey(univeName, destination)
  const cachedSchedule = await redisClient.get(key)
  if (!cachedSchedule) {
    return null
  }
  return JSON.parse(cachedSchedule)
}

/**
 * 객체 배열을 사용할 때 수정에 용이할 필요가 없고, 데이터 크기가 크지 않으므로 value를 string으로 저장
 * @param {string} univeName key생성 요소
 * @param {string} destination key생성 요소
 * @param {{univeName: string, destination: string, time: string, duration: string, continuity: boolean}[]} schedule 생성 시간표
 */
const setScheduleInRedis = async (univeName, destination, schedule) => {
  const key = scheduleKey(univeName, destination)
  const value = JSON.stringify(schedule)
  const result = await redisClient.set(key, value, { EX: CACHE_EX })
  return result
}

module.exports = { getScheduleInRedis, setScheduleInRedis }
