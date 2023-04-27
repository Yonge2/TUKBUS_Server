const express = require('express');
const router = express.Router();

const {register, sendmail, mail_auth_check, userIdCheck} = require('./user_util/register_util');
const {loginPass, logOut, Withdraw} = require('./user_util/login_util');
const jwt_middleWare = require('./user_util/authMiddleware');
const refresh_token = require('./user_util/refresh_token');
const {checkPW, changingPW, findPW} = require('./user_util/changePW');
const {reportUser, blockUser, blockedUserList, submitOpnion, delBlockedUser} = require('./user_util/reportUser');


//로그인
router.post('/login', loginPass);
router.get('/logout', jwt_middleWare, logOut);

//헤더에 authorization, refresh 실어서 보내셈
router.get('/login/refresh', refresh_token);

//-------------------------------------------------//
//checking mail -> register
router.post('/register/authmail', async(req, res)=>{
    sendmail(req, res, 'register');
});
router.post('/register/authmail/check', mail_auth_check);
router.post('/register/idcheck', userIdCheck);
router.post('/register', register);

//-------------------------------------------------//
//checking mail -> changing password
router.post('/findpw/authmail', async(req, res)=>{
    sendmail(req, res, 'findpassword');
})
router.post('/findpw/authmail/check', mail_auth_check);
router.post('/findpw/changingpw', findPW);

//-------------------------------------------------//
//checking password -> changing password
router.post('/settings/checkpw', jwt_middleWare, checkPW);
router.post('/settings/changingpw', jwt_middleWare, changingPW);

//-------------------------------------------------//
router.post('/settings/submit', jwt_middleWare, submitOpnion);
router.post('/settings/block', jwt_middleWare, blockUser);
router.get('/settings/block/getlist', jwt_middleWare, blockedUserList);
router.post('/settings/block/delete', jwt_middleWare, delBlockedUser);
router.post('/settings/report', jwt_middleWare, reportUser);

//-------------------------------------------------//
router.post('/settings/withdraw', jwt_middleWare, Withdraw);

module.exports = router;