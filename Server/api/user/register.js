const express = require('express');
const router = express.Router();

const register_util = require('../../util/register_util');


//회원가입, 필요한 req 객체 : req.body.{userID, userPW, userNAME, userPHON_NUM, userEmail}
// ++ userEmail은 example@tukorea.ac.kr 붙여줘야함
router.post('/register', register_util.register);

//인증번호 메일 발송, 필요한 req객체 : req.body.userEmail
router.post('/register/authmail', register_util.sendmail);

//인증번호 체크, 필요한 req객체 : req.body.userEmail, req.body.mail_authNum
router.post('/register/authmail/check', register_util.mail_auth_check);

module.exports = router;