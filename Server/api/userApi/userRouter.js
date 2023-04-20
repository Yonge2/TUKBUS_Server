const express = require('express');
const router = express.Router();

const {register, sendmail, mail_auth_check, userIdCheck} = require('./user_util/register_util');
const {loginPass, logOut} = require('./user_util/login_util');
const jwt_middleWare = require('./user_util/authMiddleware');
const refresh_token = require('./user_util/refresh_token');
const {checkPW, changingPW} = require('./user_util/changePW');
const {reportUser, blockUser, blockedUserList, submitOpnion} = require('./user_util/reportUser');


//로그인
router.post('/login', loginPass);
router.get('/logout', jwt_middleWare, logOut);

//헤더에 authorization, refresh 실어서 보내셈
router.get('/login/refresh', refresh_token);


//회원가입, 필요한 req 객체 : req.body.{userID, userPW, userNAME, userPHON_NUM, userEmail}
// ++ userEmail은 example@tukorea.ac.kr 붙여줘야함
router.post('/register', register);

//인증번호 메일 발송, 필요한 req객체 : req.body.userEmail / 인증번호 유효시간 3분
router.post('/register/authmail', sendmail);

//인증번호 체크, 필요한 req객체 : req.body.userEmail, req.body.mail_authNum
//인증통과 유효시간 5분 (5분 뒤 인증내역 사라지니까 5분안에 가입완료 해야함)
router.post('/register/authmail/check', mail_auth_check);

//id 중복확인
router.post('/register/idcheck', userIdCheck);

//checking password -> changing password
router.post('/settings/checkPW', jwt_middleWare, checkPW);
router.post('/settings/changingpw', jwt_middleWare, changingPW);

router.post('/settings/submit', jwt_middleWare, submitOpnion);
router.post('/settings/block', jwt_middleWare, blockUser);
router.get('/settings/blockeduserlist', jwt_middleWare, blockedUserList);
router.post('/settings/report', jwt_middleWare, reportUser);


module.exports = router;