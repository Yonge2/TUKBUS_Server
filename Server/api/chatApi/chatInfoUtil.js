const {makeRandomNum} = require('../../util/utilFunc');
const {redisGetScard, redisGetSmembers} = require('../../util/redisUtil');
const {setMySQL, getMySQL} = require('../../db/conMysql');
const dayjs = require('dayjs');

const getChatlist = async(req, res)=>{
    const query = `SELECT * FROM chatinfo WHERE hostID NOT IN
        (select blockedUserID FROM blocked WHERE userID = '${req.userID}') AND isLive=true;`
    const liveChatRoomData = await getMySQL(query).catch((e)=>{
        console.log('getChatList err: ', e);
        res.status(500).json({
            success: false,
            message: e
        })
    });

    if(liveChatRoomData.length){
        const query = `SELECT blockedUserID FROM blocked WHERE userID='${req.userID}';`
        const blockedUserID = await getMySQL(query);

        const promises = liveChatRoomData.map(async(element)=>{
                return addInUserInfo(element, blockedUserID);
        })
        const allPromises = await Promise.allSettled(promises);
        //null값 제거 하기{status : 'rejected', reason: 'Blocked user In'}
        const addUserCountRoom = allPromises.map((element)=>{
            return element.value;
        })

        await res.status(200).json({
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

const addInUserInfo = async(element, blockedUserID)=>{
    return new Promise(async(resolve, reject)=>{
        const userCount = await redisGetScard(element.roomID+'_IN');
        const roomInPeople = await redisGetSmembers(element.roomID+'_IN');
        if(blockedUserID.length){
            blockedUserID.forEach((ele) => {
                if(roomInPeople.includes(ele.blockedUserID)) {
                    reject("Blocked user In");
                }
                else resolve(roomObj(element, userCount, roomInPeople));
            });
        }
        else{
            if(userCount){
                resolve(roomObj(element, userCount, roomInPeople));
            }
            else reject("chatRoom userCounting arr");
        }
    })
}

const roomObj = (origin, userCount, inUser) =>{
    return {
        hostID : origin.hostID,
        startingTime : origin.startingTime,
        startingPoint : origin.startingPoint,
        arrivalPoint : origin.arrivalPoint,
        createTime : origin.createTime,
        isLive : origin.isLive,
        roomID : origin.roomID,
        userCount : userCount,
        inUser: inUser
    }
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
    
    let insertQuery = "INSERT INTO chatInfo set ?;";
    const result = await setMySQL(insertQuery, createChatObj);
    if(result.pro)

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