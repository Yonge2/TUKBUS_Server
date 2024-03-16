const mysql = require('../database/connection')
const uuid = require('uuid')

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
  const query = `INSERT INTO ${USER_TABLE} SET ?`
  const [result] = await connection.query(query, UserObject)
  connection.release()
  return result
}

const getUserInfo = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT user_id AS userId, univ_name AS univName FROM ${USER_TABLE} WHERE email = '${email}'
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
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
    ? `UPDATE ${USER_LOG_TABLE} SET is_login=1 WHERE user_id='${userID}';`
    : `INSERT INTO ${USER_LOG_TABLE} SET user_id='${userId}';`

  const [result] = await connection.query(query)
  connection.release()
  return result
}

module.exports = { checkEmail, joinUser, getUserInfo, getLoginInfo, setUserLog }
