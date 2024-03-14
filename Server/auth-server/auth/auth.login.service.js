const bcrypt = require('bcrypt')
const { getUserInfo } = require('./auth.data')
const { jwt } = require('../util/util.mod')
const { setRefreshInReids } = require('../redis/redis-util')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config()

const NICKNAME_SERVER = process.env.NICKNAME_SERVER_URL

const loginService = async (req, res) => {
  const [email, password] = [req.body.email, req.body.password]
  if (!email || !password) {
    return res.status(400).json({ message: '이메일과 비밀번호를 입력해주세요.' })
  }
  const [user] = await getUserInfo(email)
  const loginResult = await bcrypt.compare(password, user.password)
  if (!loginResult) {
    return res.status(401).json({ message: '잘못된 로그인 정보' })
  }

  const nickname = await axios.get(NICKNAME_SERVER, {
    headers: {
      userId: user.userId,
    },
  })

  const accessToken = jwt.sign({ nickname: nickname, univName: user.univName })
  const refreshToken = jwt.refresh(user.userId)

  await setRefreshInReids(user.userId, refreshToken)

  return res.status(200).json({ accessToken, refreshToken })
}

module.exports = { loginService }
