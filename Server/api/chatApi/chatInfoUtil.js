const {makeRandomNum} = require('../../util/utilFunc');
const {redisGetScard} = require('../../util/redisUtil');
const {connection, getMySQL} = require('../../db/conMysql');
const dayjs = require('dayjs');

const getChatlist = async(req, res)=>{
    const query = "SELECT * FROM chatInfo WHERE isLive = true;";

    const liveChatRoomData = await getMySQL(query).catch((e)=>{
        console.log('getChatList err: ', e);
        res.status(500).json({
            success: false,
            message: e
        })
    });

    if(liveChatRoomData.length){
        const promises = liveChatRoomData.map((element)=>{
            return addUserCount(element);
        })
        const addUserCountRoom = await Promise.all(promises);
        res.status(200).json({
            success:true,
            message:addUserCountRoom
        })
    }
    else{
        res.status(200).json({
            success: true,
            message: "No exist chatRoomList"
        });
    }
}

const addUserCount = async(element)=>{
    return new Promise(async(resolve, reject)=>{
        const roomInPeople = await redisGetScard(element.roomID+'_IN');
        if(roomInPeople){
            resolve({
                hostID : element.hostID,
                startingTime : element.startingTime,
                startingPoint : element.startingPoint,
                arrivalPoint : element.arrivalPoint,
                createTime : element.createTime,
                isLive : element.isLive,
                roomID : element.roomID,
                userCount : roomInPeople 
            })
        }
    })
}

const createChatRoom = async(req, res) => {
    const today = new dayjs();
    const createChatObj = {
        hostID : req.body.userID,
        startingTime : req.body.startingTime,
        startingPoint : req.body.startingPoint,
        arrivalPoint : req.body.arrivalPoint,
        createTime : today.format("YYYY-MM-DD HH:mm"),
        isLive : true,
        roomID : today.format("MMDD") + req.body.userID + "_"+
        makeRandomNum(2),
    };
    
    let sql = "INSERT INTO chatInfo set ?;";
    connection.query(sql, createChatObj, (err)=>{
        if(err){
            res.status(501).json({
                success: false,
                message: err
            });
            console.log("CreateChatRoom err : ", err);
        }
        else{
            res.status(200).json({
                success: true,
                message: {roomID : createChatObj.roomID,
                    message : "CreateChatRoom OK"}
            });
        }
    });
    return createChatObj;
}



module.exports = {getChatlist, createChatRoom};