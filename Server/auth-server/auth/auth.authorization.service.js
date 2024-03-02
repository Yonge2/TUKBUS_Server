const { jwt } = require('../util/util.mod')
const { getUserInfo } = require('./auth.data')
const { getRefreshInRedis } = require('../redis/redis-util')

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
  const refreshToken = await getRefreshInRedis(result.email)
  if (reqRefreshToken != refreshToken) {
    return res.status(401).json({ message: '유효한 Refresh Token이 아닙니다.' })
  }
  //해당 user정보로 재발급
  const [userInfo] = await getUserInfo(result.email)
  const { password, ...user } = userInfo
  const newAccessToken = jwt.sign(user)

  return res.status(200).json({ newAccessToken })
}

const authorizationService = async (req, res) => {
  const token = req.headers.authorization
  if (!token) {
    return res.status(401).json({ message: 'No Token' })
  }
  const [bearer, accessToken] = token.split(' ')

  const result = await jwt.verify(accessToken)
  if (!result) {
    return res.status(401).json({ message: result.message })
  }

  return res.status(200).json({ user: { email: result.email, univName: result.univName } })
}

module.exports = { newAccessTokenService, authorizationService }
