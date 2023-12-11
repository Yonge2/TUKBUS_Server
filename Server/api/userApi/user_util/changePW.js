const {getMySQL, setMySQL} = require('../../../db/conMysql');
const salt = require('../../../private/privatekey_Tuk').nodemailer_private.salt;
const bcrypt = require('bcrypt');
const redisClient = require('../../../db/redis');
const { redisQuery, userQuery } = require('../../../private/query');

//비밀번호 찾기 : 메일체크 API -> 비번 변경
const findPW = async(req, res)=>{
    const userEmail = req.body.userEmail;
    const authCheck = await redisClient.v4.get(redisQuery.emailAuth(userEmail));

    if(!authCheck){
        return res.status(401).json({success: false, message: "메일 체크부터 하시오"});
    }

    const chagedPW = await bcrypt.hash(req.body.userPW, salt);
    const updateSet = [chagedPW, userEmail];
    const insertResult = await setMySQL(userQuery.updatePW, updateSet)

    if(!insertResult.affectedRows){
        return res.status(400).json({success: false, message: "다시 시도해주세요."})
    }

    return res.status(200).json({success: true});
}

//자의적 비번 바꾸기 : 비번체크 API -> 비번 변경
const changingPW = async(req, res)=>{
    const pwAuth = redisQuery.pwAuth(req.userID);
    const authCheck = await redisClient.v4.get(pwAuth);

    if(!authCheck){
        return res.status(401).json({success: false, message: "비번 체크부터 하시오"});
    }
    
    const chagedPW = await bcrypt.hash(req.body.userPW, salt);
    const updateSet = [chagedPW, req.userID];

    const insertResult = await setMySQL(userQuery.changePW, updateSet)
    if(!insertResult.affectedRows) {
        return res.status(400).json({success: false, message: "다시 시도해주세요."})
    }

    return res.status(200).json({success: true});
}

//비밀번호 확인
const checkPW = async(req, res)=>{
    const getPwQuery = userQuery.getPW(req.userID);
    const userOBJ = await getMySQL(getPwQuery)
    const resultPW = await bcrypt.compare(req.body.userPW, userOBJ[0].userPW)

    if(!resultPW){
        return res.status(401).json({success: false, message: "incorrect pw"})
    }

    const pwAuth = redisQuery.pwAuth(req.userID);
    redisClient.set(pwAuth, "OK", 'EX', 600, ()=>{
        console.log('PW Auth redis set for 10 min to ', req.userID);
    })

    return res.status(200).json({success: true})
}

module.exports = {changingPW, checkPW, findPW};