const express = require('express')
const authRouter = express.Router()
const bcrypt = require('bcryptjs');

const {insertOne, find} =require("../dbManager")
const {validateUser} = require("../schema")
const {generateJWT} = require("../jwt")
const logger = require("../logger.js");
const { log } = require('winston');

authRouter.post("/register", validateUser, async (req, res) => {
  try {
    const userEmail = req.body.email;
    const user = {
      "email": userEmail,
      "password": await bcrypt.hash(req.body.password, 8)
    }

    const dbUser = await find("users", {"email": userEmail})

    if (dbUser.length > 0) {
      return res.status(409).send({"Message": `The user with email ${req.body.email} already exists`})
    }

    await insertOne("users", user);
    logger.debug("User registered:", user)
    return res.status(200).send({"Message": `The new user with email ${req.body.email} was successfully registered`});
  } catch(err) {
    logger.error("Error during user registration:", err)
    return res.status(500).send({"Error": "An internal error occurred, please try again later"}) 
  }
})

authRouter.post("/login", validateUser, async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password

    const dbRecord = (await find("users", {email}))[0]
    if (!dbRecord) {
      logger.debug("Login attempt with non-existing user:", email)
      return res.status(401).send({"Error": "Invalid username or password."})
    }

    const isAuthenticated =  await bcrypt.compare(password, dbRecord.password)
    if(isAuthenticated) {
      try {
        const tokenPayload = { email: dbRecord.email, id: dbRecord.id };
        const authToken = await generateJWT(tokenPayload)
        return res.status(200).send({authToken})
      } catch(err) {
        logger.error("Error during JWT generation:", err)
        return res.status(500).send({"Error": "An internal error occurred, please try again later"})
      }
    } else {
      logger.debug("Login attempt with invalid password:", email)
      return res.status(401).send({"Error": "Invalid username or password."})
    }

  } catch(err) {
    logger.error("Error during login:", err)
    return res.status(500).send({"Error": "An internal error occurred, please try again later"}) 
  }
})

module.exports = {authRouter}
