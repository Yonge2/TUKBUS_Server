const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const {outChatroom} = require('../../chatApi/chatUtil');
const {getMySQL, setMySQL} = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const jwt = require('./jwt_util');
const {userQuery, redisQuery, chatQuery} = require('../../../private/query');


const loginPass = async(req, res) => {    
    console.log(req.body);
    const userOBJ = await getMySQL(userQuery.login(req.body.userID));

    if(userOBJ.length){
        if(await bcrypt.compare(req.body.userPW, userOBJ[0].userPW)){
            try {
                const accessToken = jwt.sign(userOBJ[0]);
                const refreshToken = jwt.refresh();
                redisClient.v4.set(redisQuery.token(userOBJ[0].userID), refreshToken);

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
                return res.status(200).json({success:false, message:'token sign failed'});
            }
        }
        else {
            return res.status(200).json({success:false, message:'Incorrected PW'});
        }
    }
    else {
        res.status(200).json({success:false, message:'ID does not exist'});
    }
}

const logOut = async(req, res)=>{
    const result = await setMySQL(userQuery.logout, 
        {userID: req.userID, status: 'logout', time: new dayjs().format('YYYY-MM-DD-HH:mm')});
    if(result.affectedRows) res.status(200).json({success: true});
    else res.status(200).json({success: false, message: 'failed logout'});
}

const Withdraw = async(req, res)=>{
    const pwAuth = redisQuery.pwAuth(req.userID);
    const authCheck = await redisClient.v4.get(pwAuth);
    
    if(authCheck){
        const getUserQuery = userQuery.getUser(req.userID);
        const withdrawalUserSet = await getMySQL(getUserQuery);

        const insertSet = {
            userID : withdrawalUserSet[0].userID,
            userEmail : withdrawalUserSet[0].userEmail,
            dayOfRegister : withdrawalUserSet[0].dayOfRegister,
            dayOfWithdraw : new dayjs().format('YYYY-MM-DD-HH:mm')
        }

        await setMySQL(userQuery.withdraw, insertSet);
        const delToken = await redisClient.v4.del(redisQuery.token(req.userID));
        await chatroomOut(req);


        const delUserQuery = userQuery.delUser(req.userID);
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



const chatroomOut = async(req)=>{
    
    const isOutQuery = chatQuery.isChatting(req.userID);
    const result = await getMySQL(isOutQuery);
    if(result.length){
        req.roomID = result[0].roomID;
        await outChatroom(req);
    }
}