const { verify } = require('./jwt_util');

const authJWT = async(req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const result = verify(token);

    if (result.success) {
      req.userID = result.userID;
      req.univNAME = result.univNAME;
      next();
    }
    else {
      console.log("<토큰인증>"+result.message);
      res.status(200).json({success: false, message: result.message});
    }
  }
  else {
    res.status(200).json({success: false, message: "No Tokens"})
  }
};

module.exports = authJWT;