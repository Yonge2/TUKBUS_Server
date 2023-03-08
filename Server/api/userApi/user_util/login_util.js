const bcrypt = require('bcrypt');

const {getMySQL} = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const jwt = require('./jwt_util');


const loginPass = async(req, res) => {
    const loginQuery = `select userID, userPW, userNAME from user where
     userID = ${req.body.userID};`
    
    const userOBJ = await getMySQL(loginQuery);

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
                        refreshToken: refreshToken,
                        userID: userOBJ.userID,
                    }
                })
                return ;
            }
            catch(err) {
                console.log(userOBJ.userNAME, ' 토큰실패\n err: ',err);
                res.status(204).json({success:false, message:'token sign fail'});
                return ;
            }
        }
        else { //비번틀림
            console.log(userOBJ.userNAME, '비번틀림');
            res.status(204).json({success:false, message:'PW is not correct'});
            return ;
        }
    }
    else {
        res.status(204).json({success:false, message:'ID is not exist'});
    }
}
    
module.exports = loginPass;