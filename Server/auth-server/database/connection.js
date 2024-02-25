const mysql = require('mysql2/promise')
const AUTH_DB = require('../../private/privatekey_Tuk').AUTH_DB

//Database configuration
const connection = mysql.createPool({
  host: AUTH_DB.HOST,
  user: AUTH_DB.USER,
  database: AUTH_DB.NAME,
  password: AUTH_DB.PW,
  port: AUTH_DB.PORT,
})

module.exports = connection
