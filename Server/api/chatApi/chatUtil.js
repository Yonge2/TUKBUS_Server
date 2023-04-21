const {getMySQL, setMySQL} = require('../../db/conMysql');
const {redisSrem, redisGetScard, redisGetSmembers} = require('../../util/redisUtil');
const dayjs = require('dayjs');

const outChatroom = async(req, res)=>{
    const roomID = req.body.roomID;
    const logQuery = 'INSERT INTO chatroom_log SET ?'
    //edit redis
    const sremResult = await redisSrem(`${roomID}_IN`, req.userID);
    //edit db
    const sqlresult = await setMySQL(logQuery, {
        userID: req.userID, 
        univNAME: req.univNAME, 
        roomID: roomID,
        status: 'out',
        time: new dayjs().format('YYYY-MM-DD HH:mm')
    })
    .catch((e)=>{ console.log('chatroom_log setsql err:', e);});

    const updateInQuery = `UPDATE chatroom_log SET status = ? WHERE userID='${req.userID}'
    AND roomID='${roomID}' AND status='ing';`

    await setMySQL(updateInQuery, 'in').catch((err)=>{
        console.log('update into chatroom_log status err : ', err);
    });

    if(sremResult && sqlresult.affectedRows) res.status(200).json({success: true});
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
    const roomID = req.body.roomID;
    const getQuery = `SELECT * FROM chatmessage WHERE roomID='${roomID} ORDER BY seqMessage;`

    const result = await getMySQL(getQuery);
    res.status(200).json({success: true, message: result});
}

module.exports = {outChatroom, saveMessage}