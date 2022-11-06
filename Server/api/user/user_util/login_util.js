const bcrypt = require('bcrypt');

const connection = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const jwt = require('./jwt_util');

module.exports = {
    loginPass : async(req, res) => {
        
        const userOBJ = await loginsql(req.body.userID)

        if(userOBJ){ //아디 통과
            if(await bcrypt.compare(req.body.userPW, userOBJ.userPW)){ //비번통과
                try {
                    const accessToken = jwt.sign(userOBJ);
                    const refreshToken = jwt.refresh();
                    //redis <id, refresh token>
                    redisClient.v4.set(userOBJ.userID+"_token", refreshToken);
                    console.log(userOBJ.userNAME, ' 로그인');
                    res.status(200).json({
                        success: true,
                        token:{
                            accessToken: accessToken,
                            refreshToken: refreshToken
                        }
                    })
                    return ;
                }
                catch(err) {
                    console.log(userOBJ.userNAME, ' 토큰실패\n err: ',err);
                    res.status(401).json({success:false, message:'token sign fail'});
                    return ;
                }
            }
            else { //비번틀림
                console.log(userOBJ.userNAME, '비번틀림');
                res.status(401).json({success:false, message:'PW is not correct'});
                return ;
            }
        }
        else {
            res.status(401).json({success:false, message:'ID is not exist'});
        }
    }
};

const loginsql = async(userID)=>{
    const loginsql = 'select userID, userPW, userNAME from user where userID = ?;'
    return new Promise((resolve, reject) => {
        connection.query(loginsql, userID, (err, result)=>{
            if(err) {
                console.log(err);
                reject(err);
            }
            else{
                resolve(result[0]);
            }
        });        
    })  
}