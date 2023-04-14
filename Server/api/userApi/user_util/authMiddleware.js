const { verify } = require('./jwt_util');

const authJWT = (req, res, next) => {

  if (req.headers.authorization) {
    const result = verify(req.headers.authorization);

    if (result.success) {
      req.userID = result.userID;
      req.univNAME = result.univNAME;
      next();
    }
    else {
      console.log("<토큰인증>"+result.message);
      res.status(201).json({success: false, message: result.message});
    }
  }
  else {
    res.status(201).json({success: false, message: "No Tokens"})
  }
};

module.exports = authJWT;