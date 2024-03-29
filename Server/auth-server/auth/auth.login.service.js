const bcrypt = require('bcrypt')
const { getLoginInfo, setUserLog } = require('./auth.data')
const { jwt } = require('../util/util.mod')
const { setRefreshInReids } = require('../redis/redis-util')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

const NICKNAME_SERVER = process.env.NICKNAME_SERVER_URL

const loginService = async (req, res) => {
  const [email, password] = [req.body.email, req.body.password]
  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' })
  }
  try {
    const [user] = await getLoginInfo(email)
    const loginResult = await bcrypt.compare(password, user.password)
    if (!loginResult) {
      return res.status(401).json({ message: '잘못된 로그인 정보' })
    }

    const nicknameResponse = await axios.get(NICKNAME_SERVER, {
      headers: {
        userId: user.userId,
      },
    })
    console.log(nicknameResponse.data)

    const accessToken = jwt.sign(nicknameResponse.data)
    const refreshToken = jwt.refresh(user.userId)

    await setRefreshInReids(user.userId, refreshToken)
    await setUserLog(user.userId)

    return res.status(200).json({ accessToken, refreshToken })
  } catch (err) {
    console.log('login err : ', err)
    return res.status(500).json({ message: '로그인 재시도 요망' })
  }
}

module.exports = { loginService }
