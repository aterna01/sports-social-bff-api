const jsonwebtoken = require('jsonwebtoken')
const config = require('./config.js')
const logger = require("./logger.js")

async function generateJWT(payload) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.sign(payload, config.JWT_SECRET, {"expiresIn": "1h"}, (err, token) => {
      if(err) {
        logger.error("Error during JWT generation:", err)
        return reject(err);
      }
      logger.debug("JWT generated:")
      resolve(token);
    })
  })
}

async function verifyJWT(req, res, next) {
  const jwtToken = req.headers["authorization"]

  if (!jwtToken) {
    return res.status(401).send({"Message": "authorization token not provided"})
  }

  try {
    const decodedToken = await new Promise((resolve, reject) => {    
      jsonwebtoken.verify(jwtToken, config.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return reject(err);
        }
        resolve(decodedToken);
      })
    })
  
    req.user = decodedToken
    logger.debug("JWT verified:")
    next()
  } catch(err) {
    logger.error("JWT verification error:", err)
    return res.status(401).send({"Message": "Invalid or expired token."})
  }
  
}

module.exports = {
  generateJWT,
  verifyJWT
}
