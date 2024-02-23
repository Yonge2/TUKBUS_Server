const mysql = require('../../database/connection')

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
  const connection = await mysql.getConnection()
  const query = `INSERT INTO ${USER_TABLE} SET ?`
  const result = await connection.query(query, UserObject)
  connection.release()
  return result
}

const getUserPassword = async (email) => {
  const connection = await mysql.getConnection()
  const query = `
  SELECT password FROM ${USER_TABLE} WHERE email = '${email}'
  `
  const [result] = await connection.query(query)
  connection.release()
  return result
}

module.exports = { checkEmail, joinUser, getUserPassword }
