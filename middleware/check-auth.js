const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decoded.userId };
    next();
  } catch (e) {
    const error = new HttpError("Authentication failed!!!!", 403);
    return next(error);
  }
};
