const mysql = require('mysql2/promise')
require('dotenv').config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 3306,
})

module.exports = connection
