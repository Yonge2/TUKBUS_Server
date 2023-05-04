const {getMySQL, setMySQL} = require('../../db/conMysql');
const redisClient = require('../../db/redis');
const {verify} = require('../../api/userApi/user_util/jwt_util');
const dayjs = require('dayjs');
const { redisGetSmembers, redisGetScard } = require('../../util/redisUtil');
const { chatQuery, redisQuery } = require('../../private/query');


const socketJWTMiddleware = async(socket, next) => {
    //check socket auth
    if (socket.handshake.auth.token && socket.handshake.auth.roomID) {
        const result = verify(socket.handshake.auth.token);

        if(result.success){
            const userID = socket.userID = result.userID;
            const roomID = socket.roomID = socket.handshake.auth.roomID;
            const inUser = await redisGetScard(redisQuery.chatRoom(roomID));
            if(inUser<4){
                const isBlocked = await checkBlock(userID, roomID);
                if(isBlocked){
                    socket.roomID = null;
                    socket.errMessage = '차단된 유저 있음';
                    next();
                }
                else{
                
                    const enterUser = await redisClient.sAdd(redisQuery.chatRoom(roomID), `${userID}`, async(err, data)=>{
                        if(!err) {
                            if(data){
                                await setMySQL(chatQuery.chatRoomLog, {
                                    userID: userID, 
                                    univNAME: result.univNAME, 
                                    roomID: roomID, 
                                    status: "ing",
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
                        else {
                            socket.errMessage = err;
                            console.log('enterUser redis 저장오류 : ', err);
                            socket.roomID = null;
                            next();
                        }
                    });
                }
            }
            else {
                socket.errMessage = "Max User";
                console.log('socket enter err : Max User');
                socket.roomID = null;
                next();
            }
            
        }
        else {
            socket.errMessage = result;
            console.log('socket jwt suceess err : ', result);
            socket.roomID = null;
            next();
        }
    }
    else {
        socket.errMessage = "socketJWT - No header!";
        console.log(socket.errMessage);
        socket.roomID = null;
        next();
    }
}



module.exports = {socketJWTMiddleware};

const checkBlock = async(userID, roomID)=>{
    const blockedUserQuery = chatQuery.blockedUserRoom(userID);

    const blockedUserID = await getMySQL(blockedUserQuery);

    if(blockedUserID.length===0) return false;
    else {
        const inUser = await redisGetSmembers(redisQuery.chatRoom(roomID));
        
        const isblock = blockedUserID.map((ele) => {
            if(inUser.includes(ele.isBlocked)) {
                return true;
            }
            else return false;
        });
        
        if(isblock.includes(true)) {
            return true;
        }
        else return false;
    }
}