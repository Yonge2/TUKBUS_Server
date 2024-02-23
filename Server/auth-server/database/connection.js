const mysql = require('mysql2/promise')
const AA_DB = require('../../private/privatekey_Tuk').AA_DB

//Database configuration
const connection = mysql.createPool({
  host: AA_DB.HOST,
  user: AA_DB.USER,
  database: AA_DB.NAME,
  password: AA_DB.PW,
  port: AA_DB.PORT,
})

module.exports = connection
