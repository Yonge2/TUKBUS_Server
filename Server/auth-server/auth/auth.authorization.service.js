const { jwt } = require('../util/util.mod')
const { getUserUniv } = require('./auth.data')
const { getRefreshInRedis } = require('../redis/redis-util')
const { getClientIp } = require('request-ip')
const dotenv = require('dotenv')
dotenv.config({
  path: process.env.MODE === 'production' ? '.production.env' : '.development.env',
})

const NICKNAME_SERVER = process.env.NICKNAME_SERVER_URL
const ACCESSIBLE_IP = process.env.ACCESSIBLE_IP

const newAccessTokenService = async (req, res) => {
  const reqAccessToken = req.headers.authorization
  const reqRefreshToken = req.headers.refresh

  //jwt 검증
  const isNeedNew = await jwt.verify(reqAccessToken)
  if (!isNeedNew.message) {
    return res.status(401).json({ message: 'Access Token 이 아직 유효함' })
  }
  const result = await jwt.refreshVerify(reqRefreshToken)
  if (!result) {
    return res.status(401).json({ message: '유효한 Refresh Token이 아닙니다.' })
  }
  //저장소의 토큰과의 검증
  const refreshToken = await getRefreshInRedis(result.userId)
  if (reqRefreshToken != refreshToken) {
    return res.status(401).json({ message: '유효한 Refresh Token이 아닙니다.' })
  }
  //해당 user정보로 재발급
  const [userUniv] = await getUserUniv(result.userId)
  const nickname = await axios.get(NICKNAME_SERVER, {
    headers: {
      userId: userInfo.userId,
    },
  })
  const payLoad = {
    ...result,
    ...userUniv,
    ...nickname.data,
  }
  const newAccessToken = jwt.sign(payLoad)

  return res.status(200).json({ newAccessToken })
}

const authorizationService = async (req, res) => {
  const isProdMode = ACCESSIBLE_IP ? true : false
  if (isProdMode) {
    const clientIp = getClientIp(req)

    if (clientIp != ACCESSIBLE_IP) {
      return res.status(403).json({ message: '접근 권한이 없습니다.' })
    }
  }

  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ message: 'No Token' })
  }
  const [bearer, accessToken] = token.split(' ')

  const result = await jwt.verify(accessToken)
  if (result.message) {
    return res.status(401).json({ message: result.message })
  }

  return res.status(200).json({ user: { nickname: result.nickname, univName: result.univName } })
}

module.exports = { newAccessTokenService, authorizationService }
