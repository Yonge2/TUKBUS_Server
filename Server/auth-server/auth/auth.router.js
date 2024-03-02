const express = require('express')
const router = express.Router()
const { joinService, checkEmailService, sendMailService, checkMailService } = require('./auth.join.service')
const { loginService } = require('./auth.login.service')
const { newAccessTokenService, authorizationService } = require('./auth.authorization.service')

//1.이메일 중복확인
router.post('/join/check/email', checkEmailService)
//2.학교 메일 인증번호 전송
router.post('/join/mail', sendMailService)
//3.학교 메일 인증
router.post('/join/check/mail', checkMailService)
//4.가입
router.post('/join', joinService)

router.post('/login', loginService)

//토큰 재발급
router.get('/new-token', newAccessTokenService)
//토큰 검증
router.get('/authorization', authorizationService)

module.exports = router
