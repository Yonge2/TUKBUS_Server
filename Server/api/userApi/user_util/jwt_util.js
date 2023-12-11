const jwt = require('jsonwebtoken');
const redisClient = require('../../../db/redis');
const { redisQuery } = require('../../../private/query');
const privateJwt = require('../../../private/privatekey_Tuk').jwt;

/**
  * sign jwt
  * @param {{userID, univNAME}} user 
  * @returns {String} token
  */
const sign = (user) => { // sign access token
  const payload = {
    userID: user.userID,
    univNAME: user.univNAME
  };

  return jwt.sign(payload, privateJwt.secret, {
    algorithm: 'HS256', 
    expiresIn: privateJwt.accessTokenExpire, 	  // 유효기간
  });
}

/**
  * verify token
  * @param {} token 
  * @returns 
  */
const verify = (token) => { // access token 검증
  try {
    const decoded = jwt.verify(token, privateJwt.secret);
    return {
      success: true,
      userID: decoded.userID,
      univNAME: decoded.univNAME
    };
  } catch (err) {
    return {
      success: false,
      message: err.message
    };
  }
}

const refresh = () => { // sign refresh token
  return jwt.sign({}, privateJwt.secret, { // not payload
    algorithm: 'HS256',
    expiresIn: privateJwt.refreshTokenExpire,
  });
}

const refreshVerify = async (token, userID) => { // refresh token 검증
  try {
    const data = await redisClient.v4.get(redisQuery.token(userID)); //redis<userID, refresh token>

    if (token === data) { //req.refresh_token
        const result = jwt.verify(token, privateJwt.secret); //sucess verify
        if(result) {
          return true
        }
        else {
          return false
        }
    }
    else { //req.refresh_token != redis<userID, refresh_token>
      return false;
    }
  }
  catch (err) {
    return false;
  }
}

module.exports = {sign, verify, refresh, refreshVerify};