const express = require('express');
const { insertOne, find, replaceOne } = require('../dbManager');
const {validateNewEvent, validateEventParticipation, validateGetEvent} = require("../schema")
const {verifyJWT} =require("../jwt")
const eventRouter = express.Router();

eventRouter.post("/create", verifyJWT, validateNewEvent, async (req, res) => {
  try {
    const {email} = req.user
    const event = {
      "title": req.body.title,
      "sportType": req.body.sportType,
      "timestamp": new Date().toISOString(),
      "date": req.body.date,
      "time": req.body.time,
      "location": req.body.location,
      "postCode": req.body.postCode,
      "description": req.body.description,
      "status": "Live",
      "participants": [],
      "owner": email,
    }

    const searchQuery = {
      "title": event.title,
      "sportType": event.sportType,
      "date": event.date,
      "time": event.time,
      "location": event.location,
      "postCode": event.postCode,
      "owner": event.owner
    }

    const dbEvent = (await find("events", searchQuery))[0]
    if(dbEvent) {
      return res.status(404).send({"Error": "This event already exists"})
    }
  
    await insertOne("events", event)
  
    return res.status(200).send({"Message": `The new event with title ${event.title} was successfully created`});
  } catch(_err) {
    return res.status(500).send({"Error": "An internal error occurred, please try again later"}) 
  }
})


eventRouter.post("/participate", verifyJWT, validateEventParticipation, async (req, res) => {
  try {
    const {title, sportType, date, time, location, postCode} = req.body
    const {email} = req.user

    const searchQuery = {
      "title": title,
      "sportType": sportType,
      "date": date,
      "time": time,
      "location": location,
      "postCode": postCode,
    }

    const dbEvent = (await find("events", searchQuery))[0]
    if(!dbEvent) {
      return res.status(404).send({"Error": `The event with provided title ${title} does not exist`})
    }

    if(dbEvent.participants.includes(email)) {
      return res.status(404).send({"Error": "The user is already registered as partipant for this event"}) 
    }

    if(new Date(dbEvent.date) < new Date()) {
      return res.status(404).send({"Error": "The event is in the past so no participation is allowed"}) 
    }

    dbEvent.participants.push(email)

    await replaceOne("events", searchQuery, dbEvent)
  
    return res.status(200).send({"Message": `The new participant ${email} registered for the event ${title}`});
  } catch(err) {
    // console.error("Error during interaction with a event: ", err)
    return res.status(500).send({"Error": "An internal error occurred, please try again later"}) 
  }
})

eventRouter.get("/get", validateGetEvent, async (req, res) => {  //search by sportType, search by postcode major part
  const {sportType, postCodeMajor} = req.query;

  const searchQuery = {
    ...(sportType && {sportType}),
    ...(postCodeMajor && {postCodeMajor})
  }

  const dbEvents = await find("events", searchQuery)

  res.status(200).send({"Events": dbEvents})
})

module.exports = {eventRouter}
