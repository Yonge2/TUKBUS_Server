const {connection} = require('../../db/conMysql');
const redisClient = require('../../db/redis');
const {verify} = require('../../api/userApi/user_util/jwt_util');
const dayjs = require('dayjs');

const receiverCheck = (receiver) =>{
    switch(receiver.length){
        case 2:
            return JSON.stringify({receiver1: receiver[0],
                receiver2: receiver[1]});
        case 1:
            return JSON.stringify({receiver1: receiver[0]})
        case 0:
            return null;    
    }
}

const saveMessage = async(obj) =>{
    const date = new dayjs();
    const message = {
        roomID: obj.roomID,
        sender: obj.userID,
        message: obj.msg,
        receiver: receiverCheck(obj.receiver),
        sendTime: obj.sendTime,
        sendDate: date.format('YYYY-MM-DD'),
    }
    console.log('insert message:', message);
    let sql = "INSERT INTO chatmessage set ?;";
    connection.query(sql, message, (err)=>{
        if(err) console.log("ChatMessage DB err : ", err);
    });
    return message;
}

const socketJWTMiddleware = async(socket, next) => {
    //check socket auth
    if (socket.handshake.auth.token && socket.handshake.auth.roomID) {
        const result = verify(socket.handshake.auth.token);

        if(result.success){
            const userID = socket.userID = result.userID;
            socket.roomID = socket.handshake.auth.roomID;
            console.log(userID);
            //insertion to redis user in room set
            await redisClient.sAdd(`${socket.handshake.auth.roomID}_IN`, `${userID}`, (err, data)=>{
                if(!err) {
                    console.log("sAdd 결과 : ",data);
                    next();
                }
                else console.log("socket middleware err: ", err);      
            });
        }
        else console.log(result, token);
    }
    else {
        //에러 추가해야함.
        console.log("no exist header!");
        next();
    }
}



module.exports = {saveMessage, socketJWTMiddleware};