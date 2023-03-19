const mysql = require('mysql');
const private = require('../private/privatekey_Tuk');
const private_db = private.db_private;

//Database configuration
const connection = mysql.createPool({
    host: "127.0.0.1",
    user: private_db.db_user,
    database: private_db.db_name, 
    password: private_db.db_pw,
    port: 3306
});


/**
   * Input: query => Output: data
   * @param {String} query 
   * @returns {Promise} data
   */
const getMySQL = (query) => {
    return new Promise((resolve, reject)=>{
       connection.query(query, (err, result)=>{
          if(err) reject(err);
          else resolve(result);
        })
    })
}

const setMySQL = (query, set) =>{
   return new Promise((resolve, reject)=>{
      connection.query(query, set, (err, result)=>{
         if(err) reject(err);
         else resolve(result);
      })
   })
}



module.exports = {connection, getMySQL, setMySQL};