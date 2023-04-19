const bcrypt = require('bcrypt');

const {getMySQL} = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const jwt = require('./jwt_util');


const loginPass = async(req, res) => {
    const loginQuery = `select userID, userPW, univNAME from user where userID = "${req.body.userID}";`
    
    const userOBJ = await getMySQL(loginQuery);

    if(userOBJ.length){ //아디 통과
        if(await bcrypt.compare(req.body.userPW, userOBJ[0].userPW)){ //비번통과
            try {
                const accessToken = jwt.sign(userOBJ[0]);
                const refreshToken = jwt.refresh();
                redisClient.v4.set(userOBJ[0].userID+"_token", refreshToken);

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
                console.log(userOBJ[0].userID, ' 토큰실패\n err: ',err);
                res.status(200).json({success:false, message:'token sign failed'});
                return ;
            }
        }
        else { //비번틀림
            res.status(200).json({success:false, message:'Incorrected PW'});
            return ;
        }
    }
    else {
        res.status(200).json({success:false, message:'ID does not exist'});
    }
}

const logOut = async(req, res)=>{
    const userID = req.userID;
    const delToken = await redisClient.v4.del(`${userID}_token`);
    console.log('del token', delToken);
    if(delToken) res.status(200).json({success: true});
    else res.status(200).json({success: false, message: 'failed logout'});
}
    
module.exports = {loginPass, logOut};