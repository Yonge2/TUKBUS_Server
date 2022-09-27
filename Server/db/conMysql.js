const mysql = require('mysql');
const private = require('../../../private/privatekey_Tuk');
const private_db = private.db_private;

const user = private_db.db_user;
const pw = private_db.db_pw;
const dbName = private_db.db_name;

//Database configuration
const connection = mysql.createPool({
    host: "127.0.0.1",
    user: user,
    database: dbName, 
    password: pw,
    port: 3306
});

module.exports = connection;