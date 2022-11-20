const { verify } = require('./jwt_util');

const authJWT = (req, res, next) => {
  if (req.headers.authorization) {
    const result = verify(req.headers.authorization); // checking token
    if (result.success) { 
      req.userID = result.userID;
      req.userNAME = result.userNAME;
      next();
    } else {
      console.log(result.message);
      res.status(401).json({success: false, message: result.message});
    }
  }
  else {
    console.log("토큰 안실림");
    res.status(401).json({success: false, message: "token is not exist"})
  }
};

module.exports = authJWT;