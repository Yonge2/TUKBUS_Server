const {getMySQL, setMySQL} = require('../../db/conMysql');
const redisClient = require('../../db/redis');
const {verify} = require('../../api/userApi/user_util/jwt_util');
const dayjs = require('dayjs');
const { redisGetSmembers } = require('../../util/redisUtil');


const socketJWTMiddleware = async(socket, next) => {
    //check socket auth
    if (socket.handshake.auth.token && socket.handshake.auth.roomID) {
        const result = verify(socket.handshake.auth.token);

        if(result.success){
            const userID = socket.userID = result.userID;
            const roomID = socket.roomID = socket.handshake.auth.roomID;
            const isBlocked = await checkBlock(userID, roomID);
            if(isBlocked){
                socket.roomID = null;
                socket.errMessage = '차단된 유저 있음';
                next();
            }
            else{
            
                await redisClient.sAdd(`${roomID}_IN`, `${userID}`, async(err, data)=>{
                    if(!err) {
                        if(data){
                            const insertLogQuery = 'INSERT INTO chatroom_log SET ?'
                            await setMySQL(insertLogQuery, {
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
                        console.log("socket middleware err: ", err);
                        socket.roomID = null;
                    }
                });
            }
        }
        else {
            console.log("socketJWT err: ", result);
            socket.roomID = null;
        }
    }
    else {
        console.log("socketJWT - No header!");
        socket.roomID = null;
        next();
    }
}



module.exports = {socketJWTMiddleware};

const checkBlock = async(userID, roomID)=>{
    const blockedUserQuery = `select if(userID='${userID}', blockedUserID, userID) as isBlocked 
        from blocked where userID='${userID}' or blockedUserID='${userID}';`

    const blockedUserID = await getMySQL(blockedUserQuery);
    console.log('차단유저 ', blockedUserID);
    if(blockedUserID.length===0) return false;
    else {
        const inUser = await redisGetSmembers(`${roomID}_IN`);
        console.log('안에 있는 유저', inUser);
        
        const isblock = blockedUserID.map((ele) => {
            console.log('차단 돌리기', inUser.includes(ele.isBlocked));
            if(inUser.includes(ele.isBlocked)) {
                console.log('차단 트루');
                return true;
            }
            else return false;
        });
        
        if(isblock.includes(true)) {
            console.log('막줄 차단', isblock.includes(true));
            return true;
        }
        else return false;
    }
}