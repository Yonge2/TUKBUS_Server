const express = require('express');
const router = express.Router();

const register_util = require('./user_util/register_util');
const login = require('./user_util/login_util');
const token_middleWare = require('./user_util/authMiddleware');
const refresh_token = require('./user_util/refresh_token');


//로그인, 필요 req객체 : req.body.{userID, userPW}
router.post('/login', login.loginPass);

//헤더에 authorization만 실어서 보내셈
// 테스트는 일반토큰 1분, 리프레쉬토큰 3분으로 설정함
router.get('/login/tokentest', token_middleWare, (req, res)=>{
    console.log(req.userID + "토큰 검증 테스트 성공");
    res.status(200).json({
        success : true,
        messgae : req.userID+", "+ req.userNAME + " 테스트 성공"
    });
})

//헤더에 authorization, refresh 실어서 보내셈
router.get('/login/refreshtest', refresh_token);


//회원가입, 필요한 req 객체 : req.body.{userID, userPW, userNAME, userPHON_NUM, userEmail}
// ++ userEmail은 example@tukorea.ac.kr 붙여줘야함
router.post('/register', register_util.register);

//인증번호 메일 발송, 필요한 req객체 : req.body.userEmail / 인증번호 유효시간 3분
router.post('/register/authmail', register_util.sendmail);

//인증번호 체크, 필요한 req객체 : req.body.userEmail, req.body.mail_authNum
//인증통과 유효시간 5분 (5분 뒤 인증내역 사라지니까 5분안에 가입완료 해야함)

router.post('/register/authmail/check', register_util.mail_auth_check);


module.exports = router;