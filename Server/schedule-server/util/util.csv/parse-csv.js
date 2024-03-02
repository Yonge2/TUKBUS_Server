const fs = require('fs')
const path = require('path')

const checkFile = () => {
  const fileName = 'TUK_SCH.csv'
  try {
    const csvPath = path.join(__dirname, '../../../', 'csvdir', fileName)
    const csvSchedule = fs.readFileSync(csvPath, 'UTF-8')
    return csvSchedule
  } catch (e) {
    console.log('checkfile fail : ', e)
    return false
  }
}
/**
 *  'TUK,8,41,1,,STATION,9,5,0'
 * @param {*} csv
 * @returns
 */
const scheduleFromCSV = async (univName, csv) => {
  const rows = csv.split('\r\n')
  const schedule = []

  //공백, header 삭제
  if (rows[rows.length - 1] === '') rows.pop()
  rows.shift()

  const result = rows.map(async (ele) => {
    const data = ele.split(',')

    data[1] = data[1].length === 1 ? '0' + data[1] : data[1]
    data[2] = data[2].length === 1 ? '0' + data[2] : data[2]
    data[5] = data[5].length === 1 ? '0' + data[5] : data[5]
    data[6] = data[6].length === 1 ? '0' + data[6] : data[6]

    const destination1_row = {
      univ_name: univName,
      destination: data[0],
      time: `${data[1]}:${data[2]}`,
      continuity: Boolean(data[3]),
    }
    const destination2_row = {
      univ_name: univName,
      destination: data[4],
      time: `${data[5]}:${data[6]}`,
      continuity: Boolean(data[7]),
    }
    if (destination1_row.destination) schedule.push(destination1_row)
    if (destination2_row.destination) schedule.push(destination2_row)
    return true
  })
  await Promise.all(result)

  return schedule
}

module.exports = { checkFile, scheduleFromCSV }
