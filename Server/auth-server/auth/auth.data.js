const mysql = require('../database/connection')
const uuid = require('uuid')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const NICKNAME_SERVER = process.env.NICKNAME_SERVER_URL

const USER_TABLE = 'user'
const USER_LOG_TABLE = 'user_log'

const checkEmail = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT NOT EXISTS(SELECT 1 FROM ${USER_TABLE} WHERE email = '${email}') AS isJoinable;
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
}

const joinUser = async (UserObject) => {
  UserObject.user_id = uuid.v4()
  const connection = await mysql.getConnection()
  await connection.beginTransaction()
  try {
    const insertQuery = `INSERT INTO ${USER_TABLE} SET ?`
    await connection.query(insertQuery, UserObject)

    const getUserInfoQuery = `SELECT user_id AS userId, univ_name AS univName FROM ${USER_TABLE} WHERE email = '${UserObject.email}' LIMIT 1`
    const [userInfo] = await connection.query(getUserInfoQuery)

    await axios.post(NICKNAME_SERVER, {
      userId: userInfo.userId,
      univName: userInfo.univName,
    })
    await connection.commit()
    return
  } catch (err) {
    await connection.rollback()
    throw new Error('Join Transaction 오류 : ' + err)
  } finally {
    connection.release()
  }
}

const getLoginInfo = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT user_id AS userId, email, password, univ_name AS univName FROM ${USER_TABLE} WHERE email = '${email}'
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
}

const setUserLog = async (userId) => {
  const connection = await mysql.getConnection()
  const selectQuery = `SELECT EXISTS(SELECT 1 FROM ${USER_LOG_TABLE} WHERE user_id='${userId}') AS isUpdate;`
  const [isUpdate] = await connection.query(selectQuery)

  const query = isUpdate[0].isUpdate
    ? `UPDATE ${USER_LOG_TABLE} SET is_login=1 WHERE user_id='${userId}';`
    : `INSERT INTO ${USER_LOG_TABLE} SET user_id='${userId}';`

  const [result] = await connection.query(query)
  connection.release()
  return result
}

module.exports = { checkEmail, joinUser, getLoginInfo, setUserLog }
