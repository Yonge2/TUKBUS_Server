const axios = require('axios')
require('dotenv').config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

const JEONGWANG_STATION = encodeURI('정왕')
const PRIORITY_1 = 1
const PRIORITY_2 = 2
const PRIORITY_3 = 3
const PRIORITY_4 = 4
const PRIORITY_OTHER = (num) => 4 + num

/**
 * 각 지하철 호선과 방향에 따른 분류, 각각의 우선순위에 따른 정렬
 */
const sortSubwayList = async (subwayList) => {
  const sortedSubwayList = {
    upLine4: [],
    downLine4: [],
    upLineSu: [],
    downLineSu: [],
  }

  //4호선 상,하행, 수인분당선 상,하행 분리
  subwayList.forEach((subway) => {
    //4호선
    if (subway.subwayId === '1004') {
      if (subway.updnLine === '상행') {
        sortedSubwayList.upLine4.push(subway)
      } else if (subway.updnLine === '하행') {
        sortedSubwayList.downLine4.push(subway)
      }
    }
    //수인분당선
    if (subway.subwayId === '1075') {
      if (subway.updnLine === '상행') {
        sortedSubwayList.upLineSu.push(subway)
      } else if (subway.updnLine === '하행') {
        sortedSubwayList.downLineSu.push(subway)
      }
    }
  })

  //각 분리된 지하철 정보 정렬
  Object.values(sortedSubwayList).forEach((val) => {
    return val.sort((a, b) => a.prior - b.prior)
  })

  return sortedSubwayList
}

/**
 * 서울시 공공데이터로부터 실시간 지하철 정보 GET, 데이터 양 N<=10
 * @param {string|'정왕'} station
 * @returns {Promise<{subwayId: string, updnLine: string, statnNm: string, bstatnNm: string, arvlMsg2: string, arvlMsg3: string, prior: number}[]>}
 */
const getMetro = async (station) => {
  const url = process.env.METRO_BASE_URL + station
  try {
    const result = await axios(url)
    const responseCode = result.data.errorMessage.status
    if (responseCode != 200) {
      throw new Error('Get Subway Error : ', result.errorMessage.message)
    }

    //data-transform
    const subwayList = result.data.realtimeArrivalList.map((ele) => {
      const subway = {
        subwayId: ele.subwayId,
        updnLine: ele.updnLine,
        statnNm: ele.statnNm,
        bstatnNm: ele.bstatnNm + '행',
        arvlMsg2: ele.arvlMsg2,
        arvlMsg3: ele.arvlMsg3,
      }
      //정렬을 위한 우선순위 부여
      const locate = ele.arvlMsg2.split(' ')
      if (locate[1] === '도착') {
        if (locate[0] === '정왕') {
          subway.prior = PRIORITY_1
        } else {
          subway.prior = PRIORITY_3
        }
      } else if (locate[1] === '진입') {
        if (locate[0] === '정왕') subway.prior = PRIORITY_2
        else subway.prior = PRIORITY_4
      } else {
        const delOne = locate[0].split('[')
        const delTwo = delOne[1].split(']')
        const leftNumber = Number(delTwo[0])
        subway.prior = PRIORITY_OTHER(leftNumber)
      }
      return subway
    })
    return subwayList
  } catch (err) {
    console.log('Subway Error : ', err.message)
    return []
  }
}

module.exports = { getMetro, sortSubwayList, JEONGWANG_STATION }
