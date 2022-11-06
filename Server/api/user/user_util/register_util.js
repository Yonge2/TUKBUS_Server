const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

const connection = require('../../../db/conMysql');
const redisClient = require('../../../db/redis');
const auth_private = require('../../../../../private/privatekey_Tuk').nodemailer_private;


module.exports = {
//-----------------------------------register-------------------------------------//
    register: async(req, res)=>{
        //check mail auth
        const registerAuth = await redisClient.v4.get(req.body.userEmail+"_registerAuth")
        console.log(registerAuth)

        if(registerAuth){
            const registerSet = await reqInfo(req);

            const insertsql = 'insert into user set ?'
            connection.query(insertsql, registerSet, (err, result)=>{
                if(err) {
                    console.log(err);
                }
                else{
                    res.status(200).send('ok');
                    console.log('insert ok')
                }
            });
        }
        else res.status(401).json({success: false, message: "메일이 인증되지 않았음."})
        
        
    },

//-----------------------------------send to auth mail-------------------------------------//
    sendmail: async(req, res)=>{
        
        const mail_authNum = await Math.floor(Math.random()*10000).toString();

        //example("email_mailAuth" : "1234", expire after 180sec)
        redisClient.set(req.body.userEmail+"_mailAuth", mail_authNum, 'EX', 180, ()=>{
            console.log('mail Auth redis set for 3 min to ', req.body.userEmail);
        });
        
        const mailOBJ = await mailObj(mail_authNum, req.body.userEmail);

        const mailTransport = nodemailer.createTransport(mailOBJ.createMailObj);

        await mailTransport.sendMail(mailOBJ.mailOptions,(err, info)=>{

            if(err) {
                res.status(400).json({success: false, message: "email 발송 오류"})
                console.log("email 발송오류 : ",err);
            }
            else{
                res.status(200).json({success: true, message: ""});
                console.log(info.envelope.to," 에게 인증메일 발송");
            }
        });
    },
      
//---------------------------------chck auth num-------------------------------------------//
    mail_auth_check: async(req, res)=>{
        const checkNum = await redisClient.v4.get(req.body.userEmail+"_mailAuth");

        if(checkNum){
            if(checkNum == req.body.mail_authNum){
                redisClient.set(req.body.userEmail+"_registerAuth", "OK", 'EX', 300, ()=>{
                    console.log('register Auth redis set for 5 min to ', req.body.userEmail);
                })
                res.status(200).json({
                    success: true,
                    message: "메일인증 완료"
                });
            }
            else{
                res.status(401).json({
                    success: false,
                    message: "인증번호 틀림"
                });
            }
        }
        else{
            res.status(401).json({
                success: false,
                message: "요청 아이디로 인증번호 저장이 안됨."
            })
        }
    }
}

//---------------------------------------for clean code -------------------------// 
async function mailObj(authnum, userEmail){
    
    const createMailObj = {
        service: "Gmail",
        auth: auth_private.auth,
        tls: {
            rejectUnauthorized: false
        }
    }

    const mailOptions = {
        from: auth_private.email,
        to: userEmail,
        subject: "TUK BUS 가입을 위한 인증번호 입니다.",
        text: "인증번호는 " + authnum + " 입니다."
    };

    return {
        createMailObj: createMailObj,
        mailOptions: mailOptions
    }
}


async function reqInfo(req){

    let registerUser_Info = {};

    registerUser_Info.userID = await req.body.userID;
    registerUser_Info.userPW = await bcrypt.hash(req.body.userPW, 10);
    registerUser_Info.userNAME = await req.body.userNAME;
    registerUser_Info.userPHON_NUM = await req.body.userPHON_NUM;
    registerUser_Info.userEmail = await req.body.userEmail;
    registerUser_Info.dayOfRegister = await new Date(+new Date() + 3240 * 10000).toISOString().split("T")[0];

    return registerUser_Info;
}