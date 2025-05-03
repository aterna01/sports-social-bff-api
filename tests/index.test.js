const { describe, it, beforeAll, afterAll } = require("@jest/globals");
const server = require("../src/index");
const testCases = require("./testCases.json");
const { closeClient, dropCollection} = require("../src/dbManager");
const {
  registerAssert,
  loginAssert,
  commonAssert
} = require("./assertions");

const actionMapper = {
  register: registerAssert,
  login: loginAssert,
  failAuth: commonAssert,
  main: commonAssert,
  // createPost: postCreateAssert,
  // getPosts: postGetAssert,
  // interactPost: postInteractAssert,
};

describe("Server testing", () => {
  beforeAll(async () => {
    await dropCollection("users");
    await dropCollection("events");
  });

  // Close the server and Mongodb conn after all tests
  afterAll(async () => {
    await closeClient();
    server.close();
  });

  testCases.forEach((testCase) => {
    it(testCase.description, async () => {
      const actionAssertFunc = actionMapper[testCase.action];
      await actionAssertFunc(testCase);
    });
  });
});
