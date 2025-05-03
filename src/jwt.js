const jsonwebtoken = require('jsonwebtoken')
require('dotenv').config()

async function generateJWT(payload) {
  return new Promise((resolve, reject) => {
    jsonwebtoken.sign(payload, process.env.JWT_SECRET, {"expiresIn": "1h"}, (err, token) => {
      if(err) {
        return reject(err);
      }
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
      jsonwebtoken.verify(jwtToken, process.env.JWT_SECRET, (err, decodedToken) => {
        if (err) {
          return reject(err);
        }
        resolve(decodedToken);
      })
    })
  
    req.user = decodedToken
    next()
  } catch(err) {
    console.error("JWT verification error:", err);
    return res.status(401).send({"Message": "Invalid or expired token."})
  }
  
}

module.exports = {
  generateJWT,
  verifyJWT
}
