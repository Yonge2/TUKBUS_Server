const {getMySQL, setMySQL} = require('../../../db/conMysql');
const salt = require('../../../private/privatekey_Tuk').nodemailer_private.salt;
const bcrypt = require('bcrypt');
const redisClient = require('../../../db/redis');

const changingPW = async(req, res)=>{
    const authCheck = await redisClient.v4.get(req.userID+"_PwAuth");
    console.log(authCheck);

    if(authCheck){
        const chagedPW = await bcrypt.hash(req.body.userPW, salt);
        const updateQuery = 'UPDATE user SET userPW = ? WHERE userID = ?;';
        const sqlset = [chagedPW, req.userID];

        const insertResult = await setMySQL(updateQuery, sqlset).catch((e)=>{
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
    const query = `select userID, userPW from user where userID = "${req.userID}";`
    const userOBJ = await getMySQL(query).catch((e)=>{console.log(e)});
    console.log(userOBJ);
    const resultPW = await bcrypt.compare(req.body.userPW, userOBJ[0].userPW).catch((e)=>{
        console.log("에러", e);
    });
    console.log("결과",resultPW);

    if(resultPW){
        redisClient.set(req.userID+"_PwAuth", "OK", 'EX', 600, ()=>{
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

module.exports = {changingPW, checkPW};