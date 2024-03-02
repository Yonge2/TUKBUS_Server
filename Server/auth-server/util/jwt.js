const jwt = require('jsonwebtoken')
require('dotenv').config()

/**
 * sign jwt
 * @param {{email, univName}} user
 * @returns {String} token
 */
const sign = (user) => {
  // sign access token
  const payload = { email: user.email, univName: user.univName }

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
      email: verified.email,
      univName: verified.univName,
    }
  } catch (err) {
    return {
      message: err.message,
    }
  }
}

const refresh = (email) => {
  // sign refresh token
  return jwt.sign({ email: email }, process.env.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: process.env.RT_EXPIRED,
  })
}

const refreshVerify = async (token) => {
  // refresh token 검증
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET) //sucess verify
    return {
      email: verified.email,
    }
  } catch {
    return false
  }
}

module.exports = { sign, verify, refresh, refreshVerify }
