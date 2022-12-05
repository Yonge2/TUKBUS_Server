const {makeRandomNum} = require('../../util/utilFunc');
const {redisGetScard} = require('../../util/redisUtil');
const connection = require('../../db/conMysql');
const dayjs = require('dayjs');

const getChatlist = async(req, res)=>{
    const sql = "SELECT * FROM chatInfo WHERE isLive = true;";
    connection.query(sql, async(err, result)=>{
        if(err) {
            res.status(501).json({
                success: false,
                message: err
            });
        }
        else{
            //데이터 없을 때 추가해야함.
            new Promise((resolve, reject) => {
                if(result.length === 0) reject();
                result.forEach(async(element, index) => {
                    const roomInPeople = await redisGetScard(result[index].roomID+"_IN");
                    if(roomInPeople){
                        result[index].userCount = roomInPeople;
                        if(index === result.length-1) resolve(result);
                    }
                    else reject();

                });
            })
            .then((chatRoomList)=>{
                res.status(200).json({
                    success:true,
                    message:chatRoomList,
                });
            })
            .catch(()=>{
                res.status(200).json({
                    success: true,
                    message: "No exist chatRoomList"
                });
            });
        }
    });
}

const createChatRoom = async(req, res) => {
    const today = new dayjs();
    const createChatObj = {
        hostID : req.userID,
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