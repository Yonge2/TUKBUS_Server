const {getMySQL, setMySQL} = require('../../db/conMysql');
const dayjs = require('dayjs');

const chatting = (io) =>{

    const chat = io.of('/chat').on('connection', async(socket)=>{
        if(socket.errMessage){
            socket.emit('checkErr', 'out');
        }
        else{
            socket.join(socket.roomID);
        
            if(socket.firstIn) {
                await setFirstMessageIndex(socket.userID, socket.roomID);
                chat.to(socket.roomID).emit("in", socket.userID);
            }
            
            socket.on('chat message', async(data)=>{
                data.roomID = socket.roomID;
                data.userID = socket.userID;
    
                chat.to(socket.roomID).emit('chat message', {
                    userID : data.userID,
                    message : data.message,
                    time : data.time
                });
            })
        
            socket.on('disconnect', async()=>{
                const now = new dayjs().subtract(1, "m").format('HH:mm');
                const isOutQuery = `SELECT * FROM chatroom_log WHERE roomID='${socket.roomID}' AND 
                userID='${socket.userID}' AND time>='${now}' AND status='out';`
    
                const isOut = await getMySQL(isOutQuery);
    
                //out
                if(isOut.length) {
                    chat.to(socket.roomID).emit('out', socket.userID);
                }
            });
        }
    })
}

module.exports = chatting;


const setFirstMessageIndex = async(userID, roomID)=>{
    const now = new dayjs();

    await recordInMsg(userID, roomID, now).catch((err)=>{
        console.log('record In msg err : ', err);
    });

    const checkMessageQuery = `SELECT indexMessage FROM chatmessage WHERE roomID='${roomID}' 
    AND time='${now.format('HH:mm')}' AND message='${userID}님이 입장했습니다.';`
    
    const FirstMessage = await getMySQL(checkMessageQuery).catch((err)=>{
        console.log('check last message err: ', err);
    });

    console.log('first messg',FirstMessage);
    console.log('first messg',FirstMessage[0].indexMessage);

    const firstMsgIndex = FirstMessage[0].indexMessage;

    const updateFirstMsgQuery = `UPDATE chatroom_log SET firstMsgIndex = ? WHERE userID='${userID}'
    AND roomID='${roomID}' AND status='ing'`

    await setMySQL(updateFirstMsgQuery, firstMsgIndex).catch((err)=>{
        console.log('update first message index err: ', err);
    });
}

const recordInMsg = async(userID, roomID, now)=>{
    const inQuery = `INSERT INTO chatmessage SET ?`
    await setMySQL(inQuery, {
        roomID: roomID,
        userID: null,
        message: `${userID}님이 입장했습니다.`,
        receiver: null,
        time: now.format('HH:mm'),
        Date: now.format('YYYY-MM-DD')
    })
    .catch((err)=>{
        console.log('record in msg err : ', err);
    })
}