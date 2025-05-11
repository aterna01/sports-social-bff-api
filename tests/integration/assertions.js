const { expect } = require("@jest/globals");
const request = require("supertest");
const server = require("../../src/index");
const { find } = require("../../src/dbManager");

// JWT tokens are created dynamically in each full test run
const userTokenMapper = {
  Olga: "",
  Nick: "",
  Mary: "",
  Nestor: "",
};

async function commonAssert(testCase) {
  const { HTTPVerb, path, statusCode, expectedMsg } = testCase;
  const res = await request(server)[HTTPVerb](path);
  expect(res.status).toBe(statusCode);
  expect(res.text).toBe(expectedMsg);
}

async function registerAssert(testCase) {
  const { HTTPVerb, path, payload, statusCode, expectedMsg, expectedRecordsInDB } = testCase;
  const res = await request(server)[HTTPVerb](path)
    .send(payload)
    .set("Accept", "application/json");

  expect(res.status).toBe(statusCode);
  expect(res.text).toBe(expectedMsg);

  const dbRecord = await find("users", { email: payload.email });
  expect(dbRecord.length).toBe(expectedRecordsInDB);
}

async function loginAssert(testCase) {
  const { user, HTTPVerb, path, payload, statusCode } = testCase;
  const res = await request(server)[HTTPVerb](path)
    .send(payload)
    .set("Accept", "application/json");

  expect(res.status).toBe(statusCode);
  expect(res.text).toBeDefined();

  const parsedTextRes = JSON.parse(res.text);
  userTokenMapper[user] = parsedTextRes.authToken; //write token to userTokenMapper so it can be used in tests bellow
}

module.exports = {
  registerAssert,
  loginAssert,
  commonAssert
};
