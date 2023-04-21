const {getMySQL, setMySQL} = require('../../db/conMysql');
const dayjs = require('dayjs');

const chatting = (io) =>{

    const chat = io.of('/chat').on('connection', async(socket)=>{
        socket.join(socket.roomID);
        
        if(socket.firstIn) {
            await setFirstMessageSeq(socket.userID, socket.roomID);
            chat.to(socket.roomID).emit("in", socket.userID);
        }
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
            const isOutQuery = `SELECT * FROM chatroom_log WHERE roomID='${socket.roomID}' AND 
            userID='${socket.userID}' AND status='out';`

            const isOut = await getMySQL(isOutQuery);
            //이거 이전 아웃까지 계산하니까 이거 수정 ㄱㄱ

            //out
            if(isOut.length) {
                chat.to(socket.roomID).emit('out', socket.userID);
            }
        });
    })
}

module.exports = chatting;

const callMsg = async(userID, roomID)=>{ //파라미터 page 추가 각
    const now = dayjs().format('HH:mm');

    const isLastMsgQuery = `SELECT FirstMsgSeq FROM chatroom_log WHERE userID='${userID}'
    AND roomID='${roomID}' AND status='ing';`
    const isFirstMsg = await getMySQL(isLastMsgQuery);
    const firstMsgSeq = (isFirstMsg[0].firstMsgSeq===undefined)? 0 : isFirstMsg[0].firstMsgSeq;


    const msgQuery = `SELECT userID, time, msg FROM chatmessage WHERE roomID='${roomID}' AND
    seqMessage > ${firstMsgSeq} AND time < '${now}' ORDER BY seqMessage;`//정렬 다시 LIMIT 20;`

    const msgArr = await getMySQL(msgQuery);
    //const reverseMsgArr = msgArr.reverse();

    return msgArr;
}


const setFirstMessageSeq = async(userID, roomID)=>{
    const now = dayjs().format('HH:mm');

    const checkMessageQuery = `SELECT seqMessage FROM chatmessage WHERE roomID='${roomID}' 
    AND time<'${now}' order by seqMessage desc limit 1;`
    
    const FirstMessage = await getMySQL(checkMessageQuery).catch((err)=>{
        console.log('check last message err: ', err);
    });

    const firstMsgSeq = (FirstMessage[0].seqMessage===undefined)? 0 : FirstMessage[0].seqMessage;

    const updateFirstMsgQuery = `UPDATE chatroom_log SET firstMsgSeq = ? WHERE userID='${userID}'
    AND roomID='${roomID}' AND status='ing'`

    await setMySQL(updateFirstMsgQuery, firstMsgSeq).catch((err)=>{
        console.log('update first message seq err: ', err);
    });
}