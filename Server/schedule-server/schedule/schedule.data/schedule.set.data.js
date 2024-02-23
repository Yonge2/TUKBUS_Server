const mysql = require('../../database/connection')

const SCH_TABLE = 'bus_sch'

const setSchedule = async (schedule, connection) => {
    const query = `INSERT INTO ${SCH_TABLE} SET ?`
    const result = await connection.query(query, schedule)
    return result
}

const deleteSchedule = async (univName) => {
    const connection = await mysql.getConnection()
    const query = `DELETE FROM ${SCH_TABLE} WHERE univ_name = '${univName}'`
    const result = await connection.query(query)
    connection.release()
    return result
}


module.exports = { setSchedule, deleteSchedule }