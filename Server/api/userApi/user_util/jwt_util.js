const jwt = require('jsonwebtoken');
const redisClient = require('../../../db/redis');
const privateJwt = require('../../../private/privatekey_Tuk').jwt;

/**
  * sign jwt
  * @param {{userID, userNAME}} user 
  * @returns {String} token
  */
const sign = (user) => { // sign access token
  const payload = {
    userID: user.userID,
    userNAME: user.userNAME,
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
  let decoded = null;
  try {
    decoded = jwt.verify(token, privateJwt.secret);
    console.log('access verify : ', decoded);
    return {
      success: true,
      userID: decoded.userID,
      userNAME: decoded.userNAME
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
    const data = await redisClient.v4.get(userID+"_token"); //redis<userID, refresh token>

    if (token === data) { //req.refresh_token
      try {
        jwt.verify(token, privateJwt.secret); //sucess verify
        return true;
      }
      catch (err) {
        return false;
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