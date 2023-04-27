const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const {getMySQL, setMySQL} = require('../../../db/conMysql');
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
    if(delToken) res.status(200).json({success: true});
    else res.status(200).json({success: false, message: 'failed logout'});
}

const Withdraw = async(req, res)=>{
    const authCheck = await redisClient.v4.get(req.userID+"_PwAuth");
    
    if(authCheck){
        const getUserQuery = `SELECT userID, userEmail, dayOfRegister FROM user WHERE userID='${req.userID}';`
        const withdrawalUserSet = await getMySQL(getUserQuery);

        const insertWithdrawalQuery = 'INSERT INTO withdrawalUser SET ?'
        const insertSet = {
            userID : withdrawalUserSet[0].userID,
            userEmail : withdrawalUserSet[0].userEmail,
            dayOfRegister : withdrawalUserSet[0].dayOfRegister,
            dayOfWithdraw : new dayjs().format('YYYY-MM-DD-HH:mm')
        }

        await setMySQL(insertWithdrawalQuery, insertSet);
        const delToken = await redisClient.v4.del(`${userID}_token`);

        const delUserQuery = `DELETE FROM user WHERE userID='${req.userID}';`
        const result = await getMySQL(delUserQuery)
        .catch((err)=>{
            console.log('del user err : ', err);
            return res.status(200).json({success: false, message: 'db err'});
        });
        
        if(result.affectedRows) res.status(200).json({success: true});
        else res.status(200).json({success: false, message: '뭔가가 잘못 됨'});
    }
    else res.status(200).json({success: false, message: '비번체크부터'});
}
    
module.exports = {loginPass, logOut, Withdraw};