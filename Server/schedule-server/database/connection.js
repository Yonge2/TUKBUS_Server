const mysql = require('mysql2/promise')
require('dotenv').config()

const connection = mysql.createPool({
  host: process.env.RDS_HOST,
  user: process.env.RDS_USER,
  database: process.env.RDS_NAME,
  password: process.env.RDS_PASSWORD,
  port: 3306,
})

module.exports = connection
