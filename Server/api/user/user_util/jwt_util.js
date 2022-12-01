const { request } = require('express');
const jwt = require('jsonwebtoken');
const redisClient = require('../../../db/redis');
const secret = require('../../../../../private/privatekey_Tuk').jwt_sec;


module.exports = {
  sign: (user) => { // sign access token
    const payload = {
      userID: user.userID,
      userNAME: user.userNAME,
    };

    return jwt.sign(payload, secret, {
      algorithm: 'HS256', 
      expiresIn: '1d', 	  // 유효기간
    });
  },

  verify: (token) => { // access token 검증
    let decoded = null;
    try {
      decoded = jwt.verify(token, secret);
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
  },

  refresh: () => { // sign refresh token
    return jwt.sign({}, secret, { // not payload
      algorithm: 'HS256',
      expiresIn: '30d',
    });
  },
  
  refreshVerify: async (token, userID) => { // refresh token 검증
    
    try {
      const data = await redisClient.v4.get(userID+"_token"); //redis<userID, refresh token>

      if (token === data) { //req.refresh_token
        try {
          jwt.verify(token, secret); //sucess verify
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
  },
};