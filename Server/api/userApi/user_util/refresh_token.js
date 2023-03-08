const { sign, verify, refreshVerify } = require('./jwt_util');
const jwt = require('jsonwebtoken');

const refresh = async (req, res) => {
  
  if (req.headers.authorization && req.headers.refresh) {
    const authToken = req.headers.authorization; //acess token
    const refreshToken = req.headers.refresh; //refresh token

    const authResult = verify(authToken); //token expire
    const decoded = jwt.decode(authToken); //decoded {userID, userNAME}
  
    // decoded token is not correct
    if (decoded === null) {
        res.json({
            success:false, 
            message: 'No authorized!'
        });
        return;
    }

    const refreshResult = await refreshVerify(refreshToken, decoded.userID); //true or fales

    if (authResult.success === false && authResult.message === 'jwt expired') {
      // 1. access token, refresh token are expired => login
      if (!refreshResult) {
        res.status(204).json({
            success:false, 
            message: 'Refresh token expired too. Please login'
        });
        return;
      } else {
        // 2. access token expired, refresh token is not expired => new access token
        const newAccessToken = sign(decoded);
        res.status(200).json({
            success:true,
            accessToken:newAccessToken, 
            refreshToken:refreshToken
        });
        return;
      }
    } else {
      // 3. access token is not expired
      res.status(204).json({
        success:false, 
        message: 'Check the Acess token'
      });
      return;
    }

  } else { // access token or refresh token is not exist in header
    res.status(204).json({
        success:false, 
        message: 'Access token and refresh token are need for refresh!'
    });
    return;
  }
};

module.exports = refresh;