const { expect } = require("@jest/globals");
const request = require("supertest");
const server = require("../src/index");
const { find } = require("../src/dbManager");

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

// async function postCreateAssert(testCase) {
//   const { user, HTTPVerb, path, payload, statusCode, expectedMsg } = testCase;
//   const res = await request(server)[HTTPVerb](path)
//     .send(payload)
//     .set("Authorization", `${userTokenMapper[user]}`)
//     .set("Accept", "application/json");

//   expect(res.status).toBe(statusCode);
//   expect(res.text).toBe(expectedMsg);

//   const dbRecord = await find("posts", { owner: payload.owner });
//   expect(dbRecord.length).toBe(1);
// }

// function assertPostInteraction(actualPosts, expectedPostsInteractions) {
//   actualPosts.forEach((post) => {
//     const expectedInteraction = expectedPostsInteractions.find(
//       (interaction) => {
//         return interaction.title === post.title;
//       }
//     );

//     expect(post.totalLikes).toBe(expectedInteraction.totalLikes);
//     expect(post.totalDislikes).toBe(expectedInteraction.totalDislikes);

//     const allPostComments = post.interactions
//       .filter((interaction) => interaction.comment)
//       .map((interaction) => interaction.comment);

//     expect(allPostComments).toStrictEqual(expectedInteraction.comments);
//   });
// }

// async function postGetAssert(testCase) {
//   const {
//     user,
//     HTTPVerb,
//     path,
//     payload,
//     statusCode,
//     expectedNoOfPosts,
//     expectedPostsInteraction,
//   } = testCase;
//   let req = request(server)[HTTPVerb](path)
//     .set("Authorization", `${userTokenMapper[user]}`);
//   if (Object.keys(payload).length > 0) {
//     req.query(payload);
//   }

//   const res = await req;
//   const { Posts } = JSON.parse(res.text);
//   expect(res.status).toBe(statusCode);
//   expect(Posts.length).toBe(expectedNoOfPosts);

//   assertPostInteraction(Posts, expectedPostsInteraction);
// }

// async function postInteractAssert(testCase) {
//   const {
//     user,
//     HTTPVerb,
//     path,
//     payload,
//     statusCode,
//     expectedMsg,
//     expectedNoOfPosts,
//     expectedPostsInteraction,
//   } = testCase;
//   const res = await request(server)[HTTPVerb](path)
//     .send(payload)
//     .set("Authorization", `${userTokenMapper[user]}`)
//     .set("Accept", "application/json");

//   expect(res.status).toBe(statusCode);
//   expect(res.text).toBe(expectedMsg);

//   const dbPosts = await find("posts");
//   expect(dbPosts.length).toBe(expectedNoOfPosts);

//   assertPostInteraction(dbPosts, expectedPostsInteraction);
// }

module.exports = {
  registerAssert,
  loginAssert,
  commonAssert
};
