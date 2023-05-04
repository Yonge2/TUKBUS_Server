const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const {getMySQL, setMySQL} = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const auth_private = require('../../../private/privatekey_Tuk').nodemailer_private;
const {makeRandomNum} = require('../../../util/utilFunc');
const {userQuery, redisQuery} = require('../../../private/query');


//-----------------------------------register-------------------------------------//
const register = async(req, res)=>{
    const userEmail = req.body.userEmail;
    //check mail auth
    if(await redisClient.v4.get(redisQuery.emailAuth(userEmail))){
        const registerSet = await reqInfo(req);

        const result = await setMySQL(userQuery.register, registerSet)
        .catch((e)=>{
            console.log(e);
            res.status(200).json({success: false, message: e});
        })
        if(result) res.status(200).json({success: true});
    }
    else res.status(200).json({success: false, message: "메일이 인증되지 않았음."})
}

//-----------------------------------send to auth mail-------------------------------------//
const sendmail = async(req, res, purpose)=>{
    const userEmail = req.body.userEmail;
    const isRegisterQuery = userQuery.isRegister(userEmail);
    const isRegistered = await getMySQL(isRegisterQuery)
    .catch((err)=>{
        console.log('중복가입 확인 err ', err);
        return res.status(200).json({success: false, message: 'db err'});
    });

    if(purpose==='register'&&isRegistered.length){
        res.status(200).json({success: false, message: '중복가입'});
    }
    else {
        const mail_authNum = makeRandomNum(4);

        redisClient.set(redisQuery.emailAuthNum(req.body.userEmail), mail_authNum, 'EX', 600, ()=>{
            console.log('mail Auth redis set for 10 min to ', req.body.userEmail);
        });
        
        const mailOBJ = mailObj(mail_authNum, req.body.userEmail, purpose);
    
        const mailTransport = nodemailer.createTransport(mailOBJ.createMailObj);
    
        mailTransport.sendMail(mailOBJ.mailOptions,(err, info)=>{
    
            if(err) {
                res.status(204).json({success: false, message: "email 발송 오류"})
                console.log("email 발송오류 : ",err);
            }
            else{
                res.status(200).json({success: true, message: ""});
                console.log(info.envelope.to," 에게 인증메일 발송");
            }
        }); 
    }
}
      
//---------------------------------chck auth num-------------------------------------------//
const mail_auth_check = async(req, res, purpose)=>{
    const checkNum = await redisClient.v4.get(redisQuery.emailAuthNum(req.body.userEmail));
    if(checkNum){
        if(checkNum == req.body.mail_authNum){
            redisClient.set(redisQuery.emailAuth(req.body.userEmail), "OK", 'EX', 600, ()=>{
                console.log('register Auth redis set for 10 min to ', req.body.userEmail);
            })
            const resObj = await checkResObj(purpose, req.body.userEmail);
            res.status(200).json(resObj);
        }
        else{
            res.status(200).json({
                success: false,
                message: "인증번호 틀림"
            });
        }
    }
    else{
        res.status(200).json({
            success: false,
            message: "요청 아이디로 잘못됨."
        })
    }
}
 //------------------------------id check---------------------------------------//
 //중복확인
 const userIdCheck = async(req, res)=>{
    const checkID = req.body.userID;
    const result = await redisClient.v4.get(redisQuery.token(checkID));
    if(result) {
        res.status(200).json({success: false});
    }
    else {
        res.status(200).json({success:true});
    }
}

module.exports = {register, sendmail, mail_auth_check, userIdCheck}


//---------------------------------------for clean code -------------------------// 
const mailObj = (authnum, userEmail, purpose) => {
    const titleText = (purpose==='register')?"'통학러' 가입을":"계정 찾기를";
    return {createMailObj: {
            service: "Gmail",
            auth: auth_private.auth,
            tls: {
                rejectUnauthorized: false
            }
        },
        mailOptions: {
            from: auth_private.email,
            to: userEmail,
            subject: `${titleText} 위한 인증번호 입니다.`,
            text: "인증번호는 " + authnum + " 입니다."
        }
    }
}

const checkResObj = async(purpose, userEmail)=>{
    if(purpose==='register'){
        return {
            success: true,
            message: "메일인증 완료, 10분간 메일 인증 유효"
        }
    }
    else {
        const findUserIdQuery = userQuery.findUserID(userEmail);
        const userID = await getMySQL(findUserIdQuery).catch((err)=>{
            console.log('find userID err : ', err);
        });
        if(userID.length){
            return {
                success: true,
                message: {userID: userID[0].userID}
            }
        }
        else{
            return {
                success: false,
                message: '이메일 없음'
            }
        }
    }
}


const reqInfo = async(req) => {
    return {
        userID: req.body.userID,
        userPW: await bcrypt.hash(req.body.userPW, auth_private.salt),
        univNAME: req.body.univNAME,
        userEmail: req.body.userEmail,
        dayOfRegister: new dayjs().format('YYYY-MM-DD-HH:mm')
    };
}