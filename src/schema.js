const Joi = require("joi")

const userSchema = Joi.object({
  "email": Joi.string().email().required(),
  "password": Joi.string().pattern(new RegExp(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?!.* ).{8,}$/)).required()
  // Password must contain one digit from 1 to 9, one lowercase letter, one uppercase letter, one special character, no space, and it must be longer than 8 characters
}).required()

const newEventSchema = Joi.object({
  "title": Joi.string().required(),
  "sportType": Joi.string().valid("football", "basketball", "tennis").required(),
  "date": Joi.string().required(),
  "time": Joi.string().required(),
  "location": Joi.string().required(),
  "postCode": Joi.string().required(),
  "description": Joi.string(),
}).required()

const eventParticipationSchema = Joi.object({
  "title": Joi.string().required(),
  "sportType": Joi.string().valid("football", "basketball", "tennis").required(),
  "date": Joi.string().required(),
  "time": Joi.string().required(),
  "location": Joi.string().required(),
  "postCode": Joi.string().required(),
})
.required()

const getEventSchema = Joi.object({
  "sportType": Joi.string().valid("football", "basketball", "tennis").default(["football", "basketball", "tennis"]),
  "postCodeMajor": Joi.string()
}).required()

function validateUser(req, res, next) {
  const {error} = userSchema.validate(req.body);
  if (error) {
    return res.status(400).send({"Error":error.details})
  }
  next()
}

function validateNewEvent(req, res, next) {
  const {error} =  newEventSchema.validate(req.body)
  if (error) {
    return res.status(400).send({"Error":error.details})
  }
  next()
}

function validateEventParticipation(req, res, next) {
  const {error} = eventParticipationSchema.validate(req.body)
  if (error) {
    return res.status(400).send({"Error":error.details})
  }
  next()
}

function validateGetEvent(req, res, next) {
  const {error} = getEventSchema.validate(req.query)
  if (error) {
    return res.status(400).send({"Error":error.details})
  }
  next()
}

module.exports = {validateUser, validateNewEvent, validateEventParticipation, validateGetEvent}
