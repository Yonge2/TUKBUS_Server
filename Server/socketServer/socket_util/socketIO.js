const {getMySQL, setMySQL} = require('../../db/conMysql');

const chatting = (io) =>{

    const chat = io.of('/chat').on('connection', async(socket)=>{
        socket.join(socket.roomID);
        
        if(socket.firstIn) chat.to(socket.roomID).emit("in", socket.userID);
        else{
            const msg = await callMsg(socket.userID, socket.roomID);
            chat.to(socket.roomID).emit('callMsg', msg);
        }
        
        socket.on('chat message', async(data)=>{
            data.roomID = socket.roomID;
            data.userID = socket.userID;

            chat.to(socket.roomID).emit('chat message', {
                userID : data.userID,
                msg : data.msg,
                time : data.time
            });
        })
    
        socket.on('disconnect', async()=>{
            const isOutQuery = 
            `SELECT * FROM chatroom_log WHERE roomID='${socket.roomID}' AND userID='${socket.userID}' AND status='out';`

             const isOut = await getMySQL(isOutQuery);
             console.log('isout:',isOut);

            if(isOut[0]) {
                const updateInQuery = `UPDATE chatroom_log SET status = ? WHERE userID='${socket.userID}'
                AND roomID='${socket.roomID}' AND status='ing';`

                await setMySQL(updateInQuery, 'in').catch((err)=>{
                    console.log('update into chatroom_log status err : ', err);
                });
                chat.to(socket.roomID).emit('out', socket.userID);
            }
            else {
                const lastMsgSeqQuery = 
                `SELECT seqMessage FROM chatmessage WHERE roomID='${socket.roomID}' ORDER BY seqMessage DESC LIMIT 1;`
                const lastMsg = await getMySQL(lastMsgSeqQuery);

                const updateLogQuery = `UPDATE chatroom_log SET lastMsgSeq = ? WHERE userID='${socket.userID}' 
                AND roomID='${socket.roomID}' AND status='ing';`
                await setMySQL(updateLogQuery, lastMsg[0].seqMessage).catch((err)=>{
                    console.log('update into chatroom_log last msg err : ', err);
                });
            }
        })
    })
}


module.exports = chatting;

const callMsg = async(userID, roomID)=>{
    const isLastMsgQuery = `SELECT lastMsgSeq FROM chatroom_log WHERE userID='${userID}'
    AND roomID='${roomID}' AND status='ing';`
    const isLastMsg = await getMySQL(isLastMsgQuery);

    if(isLastMsg[0]){
        const msgQuery = `SELECT userID, time, msg FROM chatmessage WHERE
        roomID='${roomID}' AND seqMessage > ${isLastMsg[0].lastMsgSeq};`// ORDER BY seqMEssage ASC LIMIT 20;`
        //limit은 진영이랑 상의 후 진행
        const msgArr = await getMySQL(msgQuery);
        return msgArr;
    }
    else return [];
}