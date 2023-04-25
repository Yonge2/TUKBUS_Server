const {getMySQL, setMySQL} = require('../../db/conMysql');
const {redisSrem, redisGetScard, redisGetSmembers} = require('../../util/redisUtil');
const dayjs = require('dayjs');

const outChatroom = async(req, res)=>{
    const now = new dayjs();
    const roomID = req.body.roomID;
    const sremResult = await redisSrem(`${roomID}_IN`, req.userID);

    const logQuery = 'INSERT INTO chatroom_log SET ?'
    const sqlresult = await setMySQL(logQuery, {
        userID: req.userID, 
        univNAME: req.univNAME, 
        roomID: roomID,
        status: 'out',
        time: now.format('YYYY-MM-DD HH:mm')
    })
    .catch((e)=>{ console.log('chatroom_log setsql err:', e);});

    const updateInQuery = `UPDATE chatroom_log SET status = ? WHERE userID='${req.userID}'
    AND roomID='${roomID}' AND status='ing';`

    await setMySQL(updateInQuery, 'in').catch((err)=>{
        console.log('update into chatroom_log status err : ', err);
    });

    if(sremResult && sqlresult.affectedRows) {
        await recordOutMsg(req.userID, roomID, now);
        res.status(200).json({success: true});
    }
    else res.status(200).json({success:false, message: "chatroom out err"});

    if(!await redisGetScard(`${roomID}_IN`)){
        const updateQuery = "UPDATE chatInfo SET isLive = ? WHERE roomID = ?;";
        await setMySQL(updateQuery, [false, roomID]).catch((e)=>{
            console.log('update chatInfo err :', e);
        });
    }
}


const saveMessage = async(req, res) =>{
    const roomID = req.body.roomID
    const userID = req.userID;
    const roomUser = await redisGetSmembers(`${roomID}_IN`);
    const receiver = roomUser.filter((ele)=> ele !== userID);

    const message = {
        roomID: roomID,
        userID: userID,
        msg: req.body.msg,
        receiver: receiverCheck(receiver),
        time: req.body.time,
        Date: new dayjs().format('YYYY-MM-DD'),
    }

    const Insertquery = "INSERT INTO chatmessage set ?;";
    const result = await setMySQL(Insertquery, message).catch((e)=>{
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
    const msg = await callMsg(req.userID, req.body.roomID, req.body.page).catch((err)=>{
        console.log('load msg err: ', err);
        res.status(200).json({success: false});
    });

    if(msg.length){
        res.status(200).json({success: true, message: msg});
    }
    else{
        res.status(200).json({success: true, message: []});
    }
}

const callMsg = async(userID, roomID, page)=>{
    const now = dayjs().format('HH:mm');
    const offset = 0+(page*20);

    const isLastMsgQuery = `SELECT firstMsgSeq FROM chatroom_log WHERE userID='${userID}'
    AND roomID='${roomID}' AND status='ing';`
    const isFirstMsg = await getMySQL(isLastMsgQuery);
    const firstMsgSeq = (isFirstMsg.firstMsgSeq[0]===null)? 0 : isFirstMsg[0].firstMsgSeq;

    const msgQuery = `SELECT userID, time, msg FROM chatmessage WHERE roomID='${roomID}' AND
    seqMessage > ${firstMsgSeq} AND time <= '${now}' ORDER BY seqMessage desc LIMIT 20 OFFSET ${offset};`

    const msgArr = await getMySQL(msgQuery);
    const reverseMsgArr = msgArr.reverse();

    return reverseMsgArr;
}



module.exports = {outChatroom, saveMessage, loadMessage}

const recordOutMsg = async(userID, roomID, now)=>{
    const outQuery = `INSERT INTO chatmessage SET ?`
    await setMySQL(outQuery, {
        roomID: roomID,
        userID: null,
        msg: `${userID}님이 퇴장했습니다.`,
        receiver: null,
        time: now.format('HH:mm'),
        Date: now.format('YYYY-MM-DD')
    })
    .catch((err)=>{
        console.log('record Out msg err : ', err);
    })
}