const {connection} = require('../../db/conMysql');
const {saveMessage} = require('./socketUtil');
const {redisGetScard, redisGetSmembers, redisSrem} = require('../../util/redisUtil');


const chatting = (io) =>{

    const chat = io.of('/chat').on('connection', async(socket)=>{

        console.log('connection');
        socket.join(socket.roomID);
        console.log(socket.roomID," / ", socket.userID);

        //룸안에 있는 인원 수
        let userCount = await redisGetScard(`${socket.roomID}_IN`);
        console.log("InUser : ", userCount);

        //룸안에 있는 인원
        let roomIn = null;

        //return userID
        chat.to(socket.roomID).emit("in", socket.userID);
        
        //data{roomID, message, sender, sendTime}
        socket.on('chat message', async(data)=>{
            //임시방편
            roomIn = await redisGetSmembers(`${socket.roomID}_IN`);
            await console.log("여기", roomIn);
            data.roomID = socket.roomID;
            data.userID = socket.userID;
            data.receiver = roomIn.filter((ele)=> ele !== socket.userID);
            console.log(data);
            //메세지 저장
            await saveMessage(data);

            chat.to(socket.roomID).emit('chat message', {
                userID : data.userID,
                msg : data.msg,
                time : data.sendTime
            });
        })
    
        socket.on('disconnect', async()=>{
            //퇴장이벤트
            chat.to(socket.roomID).emit('out', socket.userID);
            
            console.log('dis');

            const sremResult = await redisSrem(`${socket.roomID}_IN`, `${socket.userID}`);
            userCount = await redisGetScard(`${socket.roomID}_IN`);
            roomIn = await redisGetSmembers(`${socket.roomID}_IN`);
            console.log("삭제", sremResult, "유저수 : ", userCount);

            if(!userCount) {
                let sqlset = [false, socket.roomID];
                let sql = "UPDATE chatInfo SET isLive = ? WHERE roomID = ?;";
                connection.query(sql, sqlset, (err)=>{
                    if(err) console.log("Edit isLive err : ", err);
                })
            }
        })
    })
}
 


module.exports = chatting;