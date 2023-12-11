const { verify } = require('./jwt_util');

const authJWT = async(req, res, next) => {
  const token = req.headers.authorization;

  if(!token){
    return res.status(400).json({success: false, message: "No Tokens"})
  }

  const result = verify(token);
  if(!result.success){
    return res.status(200).json({success: false, message: result.message});
  }

  req.userID = result.userID;
  req.univNAME = result.univNAME;
  next();
};

module.exports = authJWT;