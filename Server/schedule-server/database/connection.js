const mysql = require('mysql2/promise')
const SCHEDUEL_DB = require('../../private/privatekey_Tuk').SCHEDUEL_DB

const connection = mysql.createPool({
    host: SCHEDUEL_DB.HOST,
    user: SCHEDUEL_DB.USER,
    database: SCHEDUEL_DB.NAME,
    password: SCHEDUEL_DB.PW,
    port: SCHEDUEL_DB.PORT
})

module.exports = connection