const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * sign jwt
 * @param {{nickname, univName}} user
 * @returns {String} token
 */
const sign = (user) => {
  // sign access token
  const payload = {
    nickname: user.nickname,
    univName: user.univName,
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.AT_EXPIRED,
  })
}

const verify = async (token) => {
  // access token 검증
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET)
    return {
      nickname: verified.nickname,
      univName: verified.univName,
    }
  } catch (err) {
    return {
      message: err.message,
    }
  }
}

const refresh = (userId) => {
  // sign refresh token
  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.RT_EXPIRED,
  })
}

const refreshVerify = async (token) => {
  // refresh token 검증
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET) //sucess verify
    return {
      userId: verified.userId,
    }
  } catch {
    return false
  }
}

module.exports = { sign, verify, refresh, refreshVerify }
