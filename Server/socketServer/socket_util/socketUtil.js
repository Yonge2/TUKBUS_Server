const {setMySQL} = require('../../db/conMysql');
const redisClient = require('../../db/redis');
const {verify} = require('../../api/userApi/user_util/jwt_util');
const dayjs = require('dayjs');


const socketJWTMiddleware = async(socket, next) => {
    //check socket auth
    if (socket.handshake.auth.token && socket.handshake.auth.roomID) {
        const result = verify(socket.handshake.auth.token);

        if(result.success){
            const userID = socket.userID = result.userID;
            const univNAME = result.univNAME;
            const roomID = socket.roomID = socket.handshake.auth.roomID;
            console.log(userID);
            //insertion to redis user in room set
            await redisClient.sAdd(`${socket.handshake.auth.roomID}_IN`, `${userID}`, async(err, data)=>{
                if(!err) {
                    const insertLogQuery = 'INSERT INTO chatroom_log SET'
                    await setMySQL(insertLogQuery, {
                        userID: userID, 
                        univNAME: univNAME, 
                        roomID: roomID, 
                        status: "in", 
                        time: dayjs().format('YYYY-MM-DD HH:mm')});
                    next();
                }
                else console.log("socket middleware err: ", err);      
            });
        }
        else console.log("socketJWT err: ", result);
    }
    else {
        console.log("no exist header!");
        socket.errMessage = "no exist auth"
        next();
    }
}



module.exports = {socketJWTMiddleware};