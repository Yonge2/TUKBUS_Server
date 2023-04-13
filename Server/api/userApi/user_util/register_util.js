const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const dayjs = require('dayjs');

const {setMySQL} = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const auth_private = require('../../../private/privatekey_Tuk').nodemailer_private;
const {makeRandomNum} = require('../../../util/utilFunc');


//-----------------------------------register-------------------------------------//
const register = async(req, res)=>{
    //check mail auth
    if(await redisClient.v4.get(req.body.userEmail+"_registerAuth")){

        const registerSet = await reqInfo(req);
        const insertQuery = 'insert into user set ?'

        const result = await setMySQL(insertQuery, registerSet)
        .catch((e)=>{
            console.log(e);
            res.status(200).json({success: false, message: e});
        })
        if(result) res.status(200).json({success: true});
    }
    else res.status(200).json({success: false, message: "메일이 인증되지 않았음."})
}

//-----------------------------------send to auth mail-------------------------------------//
const sendmail = async(req, res)=>{
    const mail_authNum = makeRandomNum(4);

    //example("email_mailAuth" : "1234", expire after 5min)
    redisClient.set(req.body.userEmail+"_mailAuth", mail_authNum, 'EX', 600, ()=>{
        console.log('mail Auth redis set for 10 min to ', req.body.userEmail);
    });
    
    const mailOBJ = mailObj(mail_authNum, req.body.userEmail);

    const mailTransport = nodemailer.createTransport(mailOBJ.createMailObj);

    await mailTransport.sendMail(mailOBJ.mailOptions,(err, info)=>{

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
      
//---------------------------------chck auth num-------------------------------------------//
const mail_auth_check = async(req, res)=>{
    const checkNum = await redisClient.v4.get(req.body.userEmail+"_mailAuth");

    if(checkNum){
        if(checkNum == req.body.mail_authNum){
            redisClient.set(req.body.userEmail+"_registerAuth", "OK", 'EX', 600, ()=>{
                console.log('register Auth redis set for 10 min to ', req.body.userEmail);
            })
            res.status(200).json({
                success: true,
                message: "메일인증 완료, 10분간 메일 인증 유효"
            });
        }
        else{
            res.status(204).json({
                success: false,
                message: "인증번호 틀림"
            });
        }
    }
    else{
        res.status(204).json({
            success: false,
            message: "요청 아이디로 잘못됨."
        })
    }
}
 //------------------------------id check---------------------------------------//
 //중복확인
 const userIdCheck = async(req, res)=>{
    const checkID = req.body.userID;
    const result = await redisClient.v4.get(checkID+"_token");
    if(!result) {
        res.status(200).json({success:true});
    }
    else {
        res.status(200).json({success: false});
    }
}

module.exports = {register, sendmail, mail_auth_check, userIdCheck}


//---------------------------------------for clean code -------------------------// 
const mailObj = (authnum, userEmail) => {
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
            subject: "TUK BUS 가입을 위한 인증번호 입니다.",
            text: "인증번호는 " + authnum + " 입니다."
        }
    }
}


const reqInfo = async(req) => {
    return {
        userID: req.body.userID,
        userPW: await bcrypt.hash(req.body.userPW, auth_private.salt),
        univNAME: req.body.userNAME,
        userEmail: req.body.userEmail,
        dayOfRegister: new dayjs().format('YYYY-MM-DD-HH:mm')
    };
}