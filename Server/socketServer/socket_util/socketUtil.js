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
            const roomID = socket.roomID = socket.handshake.auth.roomID;
            await redisClient.sAdd(`${roomID}_IN`, `${userID}`, async(err, data)=>{
                if(!err) {
                    if(data){
                        const insertLogQuery = 'INSERT INTO chatroom_log SET ?'
                        await setMySQL(insertLogQuery, {
                            userID: userID, 
                            univNAME: result.univNAME, 
                            roomID: roomID, 
                            status: "in", 
                            time: dayjs().format('YYYY-MM-DD HH:mm')
                        });
                        socket.firstIn = true;
                        next();
                    }
                    else {
                        socket.firstIn = false;
                        next();
                    }
                }
                else console.log("socket middleware err: ", err);      
            });
        }
        else console.log("socketJWT err: ", result);
    }
    else {
        console.log("socketJWT - No header!");
        socket.errMsg = "No auth"
        next();
    }
}



module.exports = {socketJWTMiddleware};