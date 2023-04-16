const {getMySQL, setMySQL} = require('../../db/conMysql');

const chatting = (io) =>{

    const chat = io.of('/chat').on('connection', async(socket)=>{
        socket.join(socket.roomID);
        console.log(socket.roomID," / ", socket.userID);

        //추가돼서 테스트해바야행 커밋 아직 안할게
        if(socket.firstIn) chat.to(socket.roomID).emit("in", socket.userID);

        //이것두
        socket.on('re_In', async()=>{
            const msg = await callMsg(socket.userID, socket.roomID);
            chat.to(socket.userID).emit('callMsg', msg); //자기자신한테 채팅
        })
        
        //data{roomID, message, sender, sendTime}
        socket.on('chat message', async(data)=>{
            data.roomID = socket.roomID;
            data.userID = socket.userID;
            console.log(data);

            chat.to(socket.roomID).emit('chat message', {
                userID : data.userID,
                msg : data.msg,
                time : data.sendTime
            });
        })
    
        socket.on('disconnect', async()=>{
            const isOutQuery = 
            `SELECT * FROM chatroom_log WHERE roomID='${socket.roomID}' AND userID='${socket.userID} AND status='out';`
            
            const isOut = await getMySQL(isOutQuery);
            if(isOut[0]) chat.to(socket.roomID).emit('out', socket.userID);
            else {
                const lastMsgSeqQuery = 
                `SELECT seqMessage FROM chatmessage WHERE roomID='${socket.roomID}' ORDER BY seqMessage DESC LIMIT 1;`
                const lastMsg = await getMySQL(lastMsgSeqQuery);

                const updateLogQuery = `UPDATE chatroom_log SET lastMsgSeq = ? ;`
                await setMySQL(updateLogQuery, lastMsg[0]).catch((err)=>{
                    console.log('update into chatroom_log last msg err : ', err);
                });
            }
        })
    })
}
 

module.exports = chatting;

const callMsg = async(userID, roomID)=>{
    const lastMsgQuery = `SELECT lastMsqSeq FROM chatroom_log WHERE roomID='${roomID}'
    AND userID=${userID};`
    const lastMsgSeq = await getMySQL(lastMsgQuery); //int

    const msgQuery = `SELECT sender, receiver, sendTime, message FROM chatmessage WHERE
    roomID='${roomID}' AND seqMessage>${lastMsgSeq[0]} ORDER BY seqMEssage DESC;`
    //limit은 진영이랑 상의 후 진행
    const msgArr = await getMySQL(msgQuery);

    return msgArr;
}