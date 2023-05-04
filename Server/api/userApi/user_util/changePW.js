const {getMySQL, setMySQL} = require('../../../db/conMysql');
const salt = require('../../../private/privatekey_Tuk').nodemailer_private.salt;
const bcrypt = require('bcrypt');
const redisClient = require('../../../db/redis');
const { redisQuery, userQuery } = require('../../../private/query');

const findPW = async(req, res)=>{
    const userEmail = req.body.userEmail;
    console.log(userEmail);
    const authCheck = await redisClient.v4.get(redisQuery.emailAuth(userEmail));
    console.log(redisQuery.emailAuth(userEmail));
    console.log(authCheck);
    if(authCheck){
        const chagedPW = await bcrypt.hash(req.body.userPW, salt);
        const updateSet = [chagedPW, userEmail];
        const insertResult = await setMySQL(userQuery.updatePW, updateSet).catch((e)=>{
            console.log("update PW err: ", err);
            res.status(200).json({
                success: false,
                message: err
            });
        });
        if(insertResult.affectedRows) res.status(200).json({success: true});
    }
    else res.status(200).json({
        success: false,
        message: "메일 체크부터 하시오"
    });
}

const changingPW = async(req, res)=>{
    const pwAuth = redisQuery.pwAuth(req.userID);
    const authCheck = await redisClient.v4.get(pwAuth);
    
    if(authCheck){
        const chagedPW = await bcrypt.hash(req.body.userPW, salt);
        const updateSet = [chagedPW, req.userID];

        const insertResult = await setMySQL(userQuery.changePW, updateSet).catch((e)=>{
            console.log("update PW err: ", err);
            res.status(200).json({
                success: false,
                message: err
            });
        });
        if(insertResult.affectedRows) res.status(200).json({success: true});
    }
    else res.status(200).json({
        success: false,
        message: "비번 체크부터 하시오"
    });
}

const checkPW = async(req, res)=>{
    const query = userQuery.getPW(req.userID);
    const userOBJ = await getMySQL(query).catch((e)=>{console.log(e)});
    
    const resultPW = await bcrypt.compare(req.body.userPW, userOBJ[0].userPW).catch((e)=>{
        console.log("비번 확인 에러", e);
    });

    if(resultPW){
        const pwAuth = redisQuery.pwAuth(req.userID);
        redisClient.set(pwAuth, "OK", 'EX', 600, ()=>{
            console.log('PW Auth redis set for 10 min to ', req.userID);
        })
        res.status(200).json({
            success: true
        })
    }
    else res.status(200).json({
        success: false,
        message: "incorrect pw"
    })
}

module.exports = {changingPW, checkPW, findPW};