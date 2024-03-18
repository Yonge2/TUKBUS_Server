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

connection
  .getConnection()
  .then(async (con) => {
    await con.query(
      `CREATE TABLE IF NOT EXISTS bus_sch(
        id int PRIMARY KEY auto_increment,
        univ_name varchar(50) NOT NULL,
        destination varchar(50) NOT NULL,
        time varchar(10) NOT NULL,
        continuity tinyint(1) NOT NULL,
        );`,
    )
    con.release()
  })
  .catch((err) => {
    console.log(err)
  })

module.exports = connection
