const {makeRandomNum} = require('../../util/utilFunc');
const {redisGetScard, redisGetSmembers} = require('../../util/redisUtil');
const {setMySQL, getMySQL} = require('../../db/conMysql');
const dayjs = require('dayjs');
const { chatQuery, redisQuery } = require('../../private/query');


const getChatRoomList = async(req, res)=>{
    const isIngQuery = chatQuery.isChatting(req.userID);
    const isIng = await getMySQL(isIngQuery);
    if(isIng.length){
        const ingChatRoom = await getMySQL(chatQuery.isChattingRoom(isIng[0].roomID)).catch((err)=>{
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
    const result = await setMySQL(chatQuery.createChatRoom, createChatObj).catch((e)=>{
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
    const blocedkHostQuery = chatQuery.blockedHostRoom(req.userID);
    const liveChatRoomData = await getMySQL(blocedkHostQuery).catch((e)=>{
        console.log('getChatList err: ', e);
        res.status(500).json({ success: false, message: e});
    });

    if(liveChatRoomData.length){
        const blockedUserQuery = chatQuery.blockedUserRoom(req.userID);

        const blockedUserID = await getMySQL(blockedUserQuery);

        const promises = liveChatRoomData.map((element)=>{
                return addInUserInfo(element, blockedUserID);
        })

        const allPromises = await Promise.allSettled(promises);
        const filteredRoom = allPromises.filter((ele)=> ele.status === 'fulfilled').map((ele)=> ele.value);

        res.status(200).json({
            success:true,
            message:filteredRoom
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
        const userCount = await redisGetScard(redisQuery.chatRoom(element.roomID));
        const roomInPeople = await redisGetSmembers(redisQuery.chatRoom(element.roomID));
        if(blockedUserID.length){
            blockedUserID.forEach((ele) => {
                if(roomInPeople.includes(ele.isBlocked)) {
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

