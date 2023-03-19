const {getMySQL, setMySQL} = require('../../../db/conMysql');
const salt = require('../../../private/privatekey_Tuk').nodemailer_private.salt;
const bcrypt = require('bcrypt');
const redisClient = require('../../../db/redis');

const changingPW = async(req, res)=>{
    const authCheck = await redisClient.v4.get(req.body.userID+"_PwAuth");
    if(authCheck){
        const chagedPW = await bcrypt.hash(req.body.userPW, salt);
        const updateQuery = 'UPDATE user SET userPW = ? WHERE userID = ?;';
        const sqlset = [chagedPW, req.body.userID];

        const insertResult = await setMySQL(updateQuery, sqlset);
        if(insertResult.protocol41){
            res.status(200).json({
                success: true
            });
        }
        else{
            console.log("update PW err: ", err);
            res.status(200).json({
                success: false,
                message: err
            });
        }
    }
    else res.status(200).json({
        success: false,
        message: "비번 체크부터 하시오"
    });
}

const checkPW = async(req, res)=>{
    const query = `select userID, userPW from user where userID = "${req.body.userID}";`
    const userOBJ = await getMySQL(query);

    if(await bcrypt.compare(req.body.userPW, userOBJ[0].userPW)){
        redisClient.set(req.body.userID+"_PwAuth", "OK", 'EX', 600, ()=>{
            console.log('PW Auth redis set for 10 min to ', req.body.userID);
        })
        res.status(200).json({
            success: true
        })
    }
    else res.status(200).json({
        success: false
    })
}

module.exports = {changingPW, checkPW};