const {getMySQL, setMySQL} = require('../../db/conMysql');
const { redisQuery, chatQuery } = require('../../private/query');
const {redisSrem, redisGetScard, redisGetSmembers} = require('../../util/redisUtil');
const dayjs = require('dayjs');

const outChatroom = async(req, res)=>{
    const result = await recordOutStatus(req);
    if(result.message){
        res.status(200).json({success: result.success, message: result.message});
    }
    else res.status(200).json({success: result.success});
}


const saveMessage = async(req, res) =>{
    const roomID = req.body.roomID
    const userID = req.userID;
    const roomUser = await redisGetSmembers(redisQuery.chatRoom(roomID));
    const receiver = roomUser.filter((ele)=> ele !== userID);

    const message = {
        roomID: roomID,
        userID: userID,
        message: req.body.message,
        receiver: receiverCheck(receiver),
        time: req.body.time,
        Date: new dayjs().format('YYYY-MM-DD'),
    }

    const result = await setMySQL(chatQuery.insertMessage, message).catch((e)=>{
        console.log("Insert message to DB err : ", e);
    });

    if(result.affectedRows) res.status(200).json({success: true});
    else res.status(200).json({success: false, message: 'inserting message failed'});
}


const receiverCheck = (receiver) =>{
    switch(receiver.length){
        case 2:
            return JSON.stringify({
                receiver1: receiver[0],
                receiver2: receiver[1]
            });
        case 1:
            return JSON.stringify({receiver1: receiver[0]})
        case 0:
            return null;    
    }
}

const loadMessage = async(req, res) => {
    const msg = await callMsg(req.userID, req.body.roomID, req.body.indexMessage).catch((err)=>{
        console.log('load msg err: ', err);
        return res.status(200).json({success: false});
    });
    res.status(200).json({success: true, message: msg});
}

const callMsg = async(userID, roomID, indexMessage)=>{
    const index = (indexMessage===0)?'' : `AND indexMessage < '${indexMessage}'`;

    const isFirstMsgQuery = chatQuery.firstMessage(userID, roomID);
    const isFirstMsg = await getMySQL(isFirstMsgQuery);
    
    if(isFirstMsg.length){
        const firstMsgIndex = isFirstMsg[0].firstMsgIndex;

        const msgQuery = chatQuery.loadMessage(roomID, firstMsgIndex, index);
    
        const msgArr = await getMySQL(msgQuery);
        if(indexMessage===0) {
            const reverseMsgArr = msgArr.reverse();
            return reverseMsgArr;
        }
        else return msgArr;
    }
    else return [];
}



module.exports = {outChatroom, saveMessage, loadMessage}

const recordOutMsg = async(userID, roomID, now)=>{
    await setMySQL(chatQuery.out, {
        roomID: roomID,
        userID: null,
        message: `${userID}님이 퇴장했습니다.`,
        receiver: null,
        time: now.format('HH:mm'),
        Date: now.format('YYYY-MM-DD')
    })
    .catch((err)=>{
        console.log('record Out msg err : ', err);
    })
}

const recordOutStatus = async(req)=>{
    const now = new dayjs();
    const userID = req.userID;
    const univNAME = req.univNAME;
    const roomID = req.body.roomID;
    const sremResult = await redisSrem(redisQuery.chatRoom(roomID), userID);

    const sqlresult = await setMySQL(chatQuery.chatRoomLog, {
        userID: userID, 
        univNAME: univNAME, 
        roomID: roomID,
        status: 'out',
        time: now.format('YYYY-MM-DD HH:mm')
    })
    .catch((e)=>{ console.log('chatroom_log setsql err:', e);});

    const updateInQuery = chatQuery.updateOut(userID, roomID);

    await setMySQL(updateInQuery, 'in').catch((err)=>{
        console.log('update into chatroom_log status err : ', err);
    });

    if(!await redisGetScard(redisQuery.chatRoom(roomID))){
        await setMySQL(chatQuery.deadChatroom, [false, roomID]).catch((e)=>{
            console.log('update chatInfo err :', e);
        });
    }

    if(sremResult && sqlresult.affectedRows) {
        await recordOutMsg(userID, roomID, now);
        return {success: true};
    }
    else return{success:false, message: "chatroom out err"};
}