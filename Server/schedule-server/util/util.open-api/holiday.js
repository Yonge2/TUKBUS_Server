const axios = require('axios')
const holiday_url = require('../../../private/privatekey_Tuk').hoilday_url

//return promise after either today is holiday or not
const getHolidays = async (year, month)=>{
    const url = holiday_url(year, month);
    try{
        const result = await axios(url)
        //이번 달 총 공휴일 수
        const isExistHoliday = result.data.response.body.totalCount
        if(!isExistHoliday){
            return [ ]
        }
        const holidayInfoArray = result.data.response.body.items.item
        //{locdate: 20240101(int)}
        const holidays = holidayInfoArray.map((ele)=> `${ele.locdate}`)
        return holidays
    }
    catch(e){
        console.log('holiday Axios err : ', e.message)
        return {message: 'holiday Axios err'}
    }
}

module.exports = { getHolidays }