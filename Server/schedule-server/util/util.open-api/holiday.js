const axios = require('axios')
require('dotenv').config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

//return promise after either today is holiday or not
const getHolidays = async (year, month) => {
  const url = `${process.env.HOLIDAY_BASE_URL}?serviceKey=${process.env.HOLIDAY_SERVICE_KEY}&solYear=${year}&solMonth=${month}`
  try {
    const result = await axios.get(url)
    //이번 달 총 공휴일 수
    const isExistHoliday = result.data.response.body.totalCount
    if (!isExistHoliday) {
      return []
    }
    const holidayInfoArray =
      isExistHoliday === 1 ? [result.data.response.body.items.item] : result.data.response.body.items.item
    //{locdate: 20240101(int)}
    const holidays = holidayInfoArray.map((ele) => `${ele.locdate}`)
    return holidays
  } catch (e) {
    console.log('holiday Axios err : ', e.message)
    return { message: 'holiday Axios err' }
  }
}

module.exports = { getHolidays }
