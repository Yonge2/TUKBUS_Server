const { setAuthNumInRedis, getAuthNumInRedis, setAuthJoinInRedis, getAuthJoinInRedis } = require('../redis/redis-util')
const { mailer } = require('../util/util.mod')
const bcrypt = require('bcrypt')
const { joinUser, checkEmail, getUserInfo } = require('./auth.data')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const NICKNAME_SERVER = process.env.NICKNAME_SERVER_URL

const checkEmailService = async (req, res) => {
  const email = req.body.email
  if (!email) {
    return res.status(400).json({ message: '올바른 이메일 주소를 넣어주세요.' })
  }
  const isExist = await checkEmail(email)
  return res.status(200).json({ isExist: isExist[0].isExist })
}

const sendMailService = async (req, res) => {
  const userEmail = req.body.email
  console.log(userEmail)

  //인증번호 생성
  let authNum = Math.floor(Math.random() * 10000).toString()
  console.log(authNum)
  const numLen = authNum.length
  authNum = numLen === 4 ? authNum : numLen === 3 ? '0' + authNum : numLen === 2 ? '00' + authNum : '000' + authNum

  const cachingResult = await setAuthNumInRedis(userEmail, authNum)
  if (!cachingResult) {
    return res.status(500).json({ message: '인증번호 작업 오류, 다시 시도해주세요.' })
  }

  try {
    const mailObject = await mailer.mailContent(authNum, userEmail)
    await mailer.mailer(mailObject)

    return res.status(200).json({ success: true })
  } catch (err) {
    console.log('인증 이메일 발송 오류 : ', err)
    return res.status(400).json({ message: '학교 이메일인지 다시 확인하세요' })
  }
}

const checkMailService = async (req, res) => {
  const [email, authNum] = [req.body.email, req.body.authNum]
  const cachedAuthNum = await getAuthNumInRedis(email)

  if (cachedAuthNum != authNum) {
    return res.status(401).json({ success: false, message: '틀렸거나 만료된 인증번호' })
  }
  const cachedResult = await setAuthJoinInRedis(email)
  if (!cachedResult) {
    return res.status(500).json({ message: '인증번호 작업 오류, 다시 시도해주세요.' })
  }

  return res.status(200).json({ success: true, message: '인증 여부는 10분 간 유효합니다.' })
}

const joinService = async (req, res) => {
  const [email, plainPassword, univName] = [req.body.email, req.body.password, req.body.univName]
  const isAuthJoin = await getAuthJoinInRedis(email)
  if (!isAuthJoin) {
    return res.status(401).json({ message: '이메일 인증을 완료한 후에 가입 해주세요.' })
  }

  try {
    const password = await bcrypt.hash(plainPassword, await bcrypt.genSalt())
    const joinResult = await joinUser({ email, password, univ_name: univName })
    if (!joinResult.affectedRows) {
      return res.status(400).json({ success: false, message: '잘못된 요청, 다시 시도해주세요.' })
    }

    const [userInfo] = await getUserInfo(email)
    await axios.post(NICKNAME_SERVER, { userInfo })

    return res.status(201).json({ success: true, message: `${email}님, 성공적으로 회원가입을 완료했습니다.` })
  } catch (err) {
    console.log('join err : ', err.message)
    return res.status(500).json({ message: 'server 오류, 다시 시도해주세요.' })
  }
}

module.exports = { checkEmailService, joinService, checkMailService, sendMailService }
