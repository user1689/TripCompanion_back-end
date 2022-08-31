const HttpError = require("../models/http-error");
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new HttpError('Authentication failed');
    }
    const decodeToken = jwt.verify(token, 'bestkey');
    req.userData = {userId: decodeToken.userId};
    next();
  } catch (err) {
    const error = new HttpError('Authentication failed', 401);
    return next(error);
  }

  
  

}