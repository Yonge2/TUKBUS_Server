const bcrypt = require('bcrypt');
const dayjs = require('dayjs');
const redisClient = require('../../../db/redis');

const {outChatroom} = require('../../chatApi/chatUtil');
const {getMySQL, setMySQL} = require('../../../db/conMysql');
const { sign, refresh } = require('./jwt_util');
const {userQuery, redisQuery, chatQuery} = require('../../../private/query');

/**
 로그인 요청 -> 검사(id -> pw) -> 토큰발급 및 로그인 처리
 */
const loginPass = async(req, res) => {    
    const userOBJ = await getMySQL(userQuery.login(req.body.userID));

    if(userOBJ.length===0){
        return res.status(404).json({success:false, message:'ID does not exist'});
    }

    const isCorrectPW = await bcrypt.compare(req.body.userPW, userOBJ[0].userPW)

    if(!isCorrectPW){
        return res.status(401).json({success:false, message:'Incorrected PW'});
    }

    try {
        const accessToken = sign(userOBJ[0]);
        const refreshToken = refresh();
        await redisClient.v4.set(redisQuery.token(userOBJ[0].userID), refreshToken);

        return res.status(200).json({
            success: true,
            token:{
                accessToken: accessToken,
                refreshToken: refreshToken
            }
        });
    }
    catch(err) {
        console.log(userOBJ[0].userID, ' 토큰실패\n err: ',err);
        return res.status(400).json({success:false, message:'token sign failed'});
    }
}

//로그아웃 : 로그 기록 -> 리프레시 토큰 삭제
const logOut = async(req, res)=>{
    const result = await setMySQL(userQuery.logout, 
        {userID: req.userID, status: 'logout', time: new dayjs().format('YYYY-MM-DD-HH:mm')});

    if(result.affectedRows) {
        await redisClient.v4.del(redisQuery.token(req.userID));
        return res.status(204)
    }
    else {
        return res.status(400).json({success: false, message: 'failed logout'});
    }
}

//회원 탈퇴 : 비번체크 -> 삭제 회원 로그 기록 -> 토큰삭제, 채팅중이면 채팅방 나가기
const Withdraw = async(req, res)=>{
    const pwAuth = redisQuery.pwAuth(req.userID);
    const authCheck = await redisClient.v4.get(pwAuth);

    if(!authCheck){
        return res.status(200).json({success: false, message: '비번체크부터'});
    }
    
    const getUserQuery = userQuery.getUser(req.userID);
    const withdrawalUserSet = await getMySQL(getUserQuery);
        
    const insertSet = {
        userID : withdrawalUserSet[0].userID,
        userEmail : withdrawalUserSet[0].userEmail,
        dayOfRegister : withdrawalUserSet[0].dayOfRegister,
        dayOfWithdraw : new dayjs().format('YYYY-MM-DD-HH:mm')
    }

    await setMySQL(userQuery.withdraw, insertSet);
    await redisClient.v4.del(redisQuery.token(req.userID));
    await chatroomOut(req);

    const delUserQuery = userQuery.delUser(req.userID);
    const result = await getMySQL(delUserQuery)
    
    if(result.affectedRows) {
        return res.status(200).json({success: true});
    }
    else {
        return res.status(400).json({success: false, message: '다시 요청해주세요.'});
    }
}
    
module.exports = {loginPass, logOut, Withdraw};

const chatroomOut = async(req)=>{
    const isOutQuery = chatQuery.isChatting(req.userID);
    const result = await getMySQL(isOutQuery);
    if(result.length){
        req.roomID = result[0].roomID;
        await outChatroom(req);
    }
}