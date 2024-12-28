var jwt = require('jsonwebtoken');
require('dotenv').config();
const secret = process.env.SECRETKEY;
const { errorResponse } = require('./response');
const {User} = require('../model/user.model');


exports.generateWebToken = (docId) => {
  return jwt.sign({
    data: docId,
  }, secret, { expiresIn: 60 * 60 * 24 * 7 });
}


exports.verifyWebToken = async (req, res, next) => {
  if (req.headers.authorization) {
    let token = req.headers.authorization.split(' ')[1];
    jwt.verify(token, secret, async function (err, decoded) {
      if (err) {
        errorResponse(401, "Authentication failed", res)
      } else {
        await User.findOne({ _id: decoded.data }).then(async (docs) => {
          if (docs) {
            req.userData = docs;
            next();
          }
        }).catch((err) => { console.log('auth token error', err); })
      }
    })
  } else {
    errorResponse(401, "Authentication failed", res)
  }
}

