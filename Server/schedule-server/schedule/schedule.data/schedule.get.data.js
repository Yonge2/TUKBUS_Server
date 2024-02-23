const mysql = require('../../database/connection')

const SCH_TABLE = 'bus_sch'
const NORMAL_LIMIT = 4

/**
 * 쿼리 유효성 검사 목적
 * @param {string} univName 
 * @param {string} destination 
 * @returns {Promise<boolean>}
 */
const getIsValidQuery = async (univName, destination) => {
    const operator = destination===''? 'OR' : 'AND'
    const connection = await mysql.getConnection()
    const query = `
    SELECT EXISTS(SELECT 1 FROM ${SCH_TABLE} WHERE univ_name = '${univName}' ${operator} destination = '${destination}') AS isValidQuery
    `
    const [result] = await connection.query(query)
    connection.release()
    return result
}

const getAllSchedule = async (univName) => {
    const connection = await mysql.getConnection()
    const query = `
    SELECT univ_name AS univName, destination, time, continuity
    FROM ${SCH_TABLE}
    WHERE univ_name = '${univName}'
    ORDER BY destination, time;`

    const [result] = await connection.query(query)
    connection.release()

    return result
}

const getSchedule = async(univName, destination) => {
    const connection = await mysql.getConnection()
    const query = `
    SELECT univ_name AS univName, destination, time, continuity
    FROM ${SCH_TABLE}
    WHERE univ_name = '${univName}' AND destination ='${destination}' AND time >= DATE_FORMAT(NOW(), '%H:%i')
    ORDER BY time 
    LIMIT ${NORMAL_LIMIT};`

    const [result] = await connection.query(query)
    connection.release()

    return result
}

/**
 * 17시 이후의 TUK, 등교 스케줄 생성에만 사용.  
 * time 이후의 하교 시간표를 needed 만큼 get
 */
const getMoreSchedule = async (univName, time, neededNum) => {
    const destination = 'STATION'
    const connection = await mysql.getConnection()

    const query = `
    SELECT univ_name AS univName, destination, time, continuity
    FROM ${SCH_TABLE}
    WHERE univ_name = '${univName}' AND destination ='${destination}' AND time >= '${time}'
    ORDER BY time 
    LIMIT ${neededNum};`

    const [result] = await connection.query(query)
    connection.release()

    return result
}

/**
 * 17시 이후의 TUK, 등교 스케줄 생성에만 사용.  
 * time 이전의 시간표 중 가장 가까운 시간표 부터 4개를 get
 */
const getAfter17Schedule = async () => {
    const univName = 'TUK'
    const destination = 'STATION'
    const connection = await mysql.getConnection()

    const query = `
    SELECT univ_name AS univName, destination, time, continuity
    FROM ${SCH_TABLE}
    WHERE univ_name = '${univName}' AND destination ='${destination}' AND time >= (
        SELECT time
        FROM ${SCH_TABLE}
        WHERE univ_name = '${univName}' AND destination ='${destination}' AND time < DATE_FORMAT(NOW(), '%H:%i')
        ORDER BY time desc
        LIMIT 1
    )
    ORDER BY time 
    LIMIT ${NORMAL_LIMIT};`

    const [result] = await connection.query(query)
    connection.release()

    return result
}

module.exports = {getAllSchedule, getSchedule, getMoreSchedule, getAfter17Schedule, getIsValidQuery}