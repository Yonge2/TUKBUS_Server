const {makeRandomNum} = require('../../util/utilFunc');
const {redisGetScard, redisGetSmembers} = require('../../util/redisUtil');
const {setMySQL, getMySQL} = require('../../db/conMysql');
const dayjs = require('dayjs');


const getChatRoomList = async(req, res)=>{
    const isIngQuery = `SELECT roomID FROM chatroom_log WHERE userID='${req.userID}' AND status='ing';`
    const isIng = await getMySQL(isIngQuery);
    if(isIng.length){
        const chatroomQuery = `SELECT * FROM chatInfo WHERE roomID = '${isIng[0].roomID}'`;
        const ingChatRoom = await getMySQL(chatroomQuery).catch((err)=>{
            console.log('get ING chat room err : ', err);
        });

        const chatRoom = await addInUserInfo(ingChatRoom[0], []);
        res.status(200).json({success: true, message: [chatRoom], isIng: true});
    }
    else{
        ChatRoomList(req, res);
    }
}

const createChatRoom = async(req, res) => {
    const createChatObj = createRoomObj(req);
    const insertQuery = "INSERT INTO chatInfo set ?;";
    const result = await setMySQL(insertQuery, createChatObj).catch((e)=>{
        res.status(200).json({success: false, message: e});
        console.log("CreateChatRoom err : ", e);
    });

    if(result.affectedRows){
        res.status(200).json({
            success: true, message: {roomID : createChatObj.roomID, message : "CreateChatRoom OK"}});
    }
    else res.status(200).json({success: false, message: "CreateChatRoom err"});
}


module.exports = {getChatRoomList, createChatRoom};



const ChatRoomList = async(req, res)=>{
    const query = `SELECT * FROM chatInfo WHERE hostID NOT IN (SELECT blockedUserID FROM blocked
         WHERE userID='${req.userID}' or blockedUserID='${req.userID}') AND isLive=true;`
    const liveChatRoomData = await getMySQL(query).catch((e)=>{
        console.log('getChatList err: ', e);
        res.status(500).json({ success: false, message: e});
    });

    if(liveChatRoomData.length){
        const query = `SELECT blockedUserID FROM blocked WHERE userID='${req.userID}' or blockedUserID='${req.userID}';`
        const blockedUserID = await getMySQL(query);

        const promises = liveChatRoomData.map((element)=>{
                return addInUserInfo(element, blockedUserID);
        })

        const allPromises = await Promise.allSettled(promises);
        const addUserCountRoom = allPromises.map((element)=>{
            if(element.status==='fulfilled') return element.value;
        });
        res.status(200).json({
            success:true,
            message:addUserCountRoom
        })
    }
    else{
        res.status(200).json({
            success: true
        });
    }
}


const addInUserInfo = (element, blockedUserID)=>{
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

const createRoomObj = (req)=>{
    const now = new dayjs();
    return{
        hostID : req.userID,
        startingTime : req.body.startingTime,
        startingPoint : req.body.startingPoint,
        arrivalPoint : req.body.arrivalPoint,
        createTime : now.format("YYYY-MM-DD-HH:mm"),
        isLive : true,
        roomID : now.format("MMDDHHmm_") + req.body.userID + makeRandomNum(2)
    }
}

