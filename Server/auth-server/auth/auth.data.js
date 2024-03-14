const mysql = require('../database/connection')
const uuid = require('uuid')

const USER_TABLE = 'user'

const checkEmail = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT EXISTS(SELECT 1 FROM ${USER_TABLE} WHERE email = '${email}') AS isExist
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
}

const joinUser = async (UserObject) => {
  UserObject.id = uuid.v4()
  const connection = await mysql.getConnection()
  const query = `INSERT INTO ${USER_TABLE} SET ?`
  const [result] = await connection.query(query, UserObject)
  connection.release()
  return result
}

const getUserInfo = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT user_id AS userId, univ_name AS unviName FROM ${USER_TABLE} WHERE email = '${email}'
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
}

const getLoginInfo = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT user_id AS userId, email, password, univ_name AS unviName FROM ${USER_TABLE} WHERE email = '${email}'
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
}

module.exports = { checkEmail, joinUser, getUserInfo, getLoginInfo }
