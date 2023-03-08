const { verify } = require('./jwt_util');

const authJWT = (req, res, next) => {

  if (req.headers.authorization) {

    const result = verify(req.headers.authorization); // checking token

    if (result.success) { 
      req.userID = result.userID;
      req.userNAME = result.userNAME;
      next();
    }
    else {
      console.log("<토큰인증>"+result.message);
      res.status(201).json({success: false, message: result.message});
    }
  }
  else {
    console.log("<토큰인증> 안실림>");
    res.status(201).json({success: false, message: "token is not exist"})
  }
};

module.exports = authJWT;