const express = require('express');
const router = express.Router();
const path = require('path');

const {register, sendmail, mail_auth_check, userIdCheck} = require('./user_util/register_util');
const {loginPass, logOut, Withdraw} = require('./user_util/login_util');
const jwt_middleWare = require('./user_util/authMiddleware');
const refresh_token = require('./user_util/refresh_token');
const {checkPW, changingPW, findPW} = require('./user_util/changePW');
const {reportUser, blockUser, blockedUserList, submitOpnion, delBlockedUser} = require('./user_util/reportUser');
const { getLog } = require('../../util/userLog');


//로그인
router.post('/login', async(req, res)=>{
    loginPass(req, res);
    getLog(req, 'Settings');
});
router.get('/logout', jwt_middleWare, logOut);

//헤더에 authorization, refresh 실어서 보내셈
router.get('/login/refresh', refresh_token);

//-------------------------------------------------//
//checking mail -> register
router.post('/register/authmail', async(req, res)=>{
    sendmail(req, res, 'register');
    getLog(req, 'Settings');
});
router.post('/register/authmail/check', async(req, res)=>{
    mail_auth_check(req, res, 'register');
})
router.post('/register/idcheck', userIdCheck);
router.post('/register', register);

//-------------------------------------------------//
//checking mail -> finding userID, password
router.post('/findpw/authmail', async(req, res)=>{
    sendmail(req, res, 'find');
    getLog(req, 'Settings');
})
router.post('/findpw/authmail/check', async(req, res)=>{
    mail_auth_check(req, res, 'find');
})
router.post('/findpw/changingpw', findPW);

//-------------------------------------------------//
//checking password -> changing password
router.post('/settings/checkpw', jwt_middleWare, async(req, res)=>{
    checkPW(req, res);
    getLog(req, 'Settings');
});
router.post('/settings/changingpw', jwt_middleWare, changingPW);

//-------------------------------------------------//
router.post('/settings/submit', jwt_middleWare, async(req, res)=>{
    submitOpnion(req, res);
    getLog(req, 'Settings');
});
router.post('/settings/block', jwt_middleWare, async(req, res)=>{
    blockUser(req, res);
    getLog(req, 'Settings');
});
router.get('/settings/block/getlist', jwt_middleWare, async(req, res)=>{
    blockedUserList(req, res);
    getLog(req, 'Settings');
});
router.post('/settings/block/delete', jwt_middleWare, async(req, res)=>{
    delBlockedUser(req, res);
    getLog(req, 'Settings');
});
router.post('/settings/report', jwt_middleWare, async(req, res)=>{
    reportUser(req, res);
    getLog(req, 'Settings');
});

//-------------------------------------------------//
router.get('/settings/withdraw', jwt_middleWare, Withdraw);

//-------------------------------------------------//
router.get('/privacypolicy', (req, res)=>{
    res.sendFile(path.join(__dirname, '../../private/tong_privacypolicy.html'));
});

module.exports = router;