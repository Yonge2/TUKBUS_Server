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
      `CREATE TABLE IF NOT EXISTS univ(
    univ_name varchar(50) NOT NULL,
    email_adrress varchar(255) NOT NULL UNIQUE,
    PRIMARY KEY (univ_name)
    );`,
    )

    await con.query(
      `CREATE TABLE IF NOT EXISTS user(
    user_id varchar(36) NOT NULL,
    email varchar(255) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    create_at DATETIME NOT NULL DEFAULT now(),
    univ_name varchar(50) NOT NULL,
    PRIMARY KEY (user_id),
    FOREIGN KEY (univ_name) REFERENCES univ (univ_name)
    );`,
    )

    await con.query(
      `CREATE TABLE IF NOT EXISTS user_log(
      user_id varchar(36) NOT NULL,
      is_login tinyint(1) NOT NULL DEFAULT 1,
      update_at DATETIME NOT NULL DEFAULT now() ON UPDATE now()
      );`,
    )
    con.release()
  })
  .catch((err) => {
    console.log(err)
  })

module.exports = connection
