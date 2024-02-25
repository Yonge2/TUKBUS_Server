const jwt = require('jsonwebtoken')
const privateJwt = require('../../private/privatekey_Tuk').jwt

/**
 * sign jwt
 * @param {{email, univNAME}} user
 * @returns {String} token
 */
const sign = (user) => {
  // sign access token
  const payload = { email: user.email, univName: user.univName }

  return jwt.sign(payload, privateJwt.secret, {
    algorithm: 'HS256',
    expiresIn: privateJwt.accessTokenExpire, // 유효기간
  })
}

const verify = async (token) => {
  // access token 검증
  try {
    const verified = jwt.verify(token, privateJwt.secret)
    return {
      email: verified.email,
      univNAME: verified.univNAME,
    }
  } catch (err) {
    return {
      message: err.message,
    }
  }
}

const refresh = (email) => {
  // sign refresh token
  return jwt.sign({ email: email }, privateJwt.secret, {
    algorithm: 'HS256',
    expiresIn: privateJwt.refreshTokenExpire,
  })
}

const refreshVerify = async (token) => {
  // refresh token 검증
  try {
    const verified = jwt.verify(token, privateJwt.secret) //sucess verify
    return {
      email: verified.email,
    }
  } catch {
    return false
  }
}

module.exports = { sign, verify, refresh, refreshVerify }
