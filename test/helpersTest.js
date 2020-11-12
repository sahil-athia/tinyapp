const { assert } = require('chai');
const { getUserByEmail } = require('../helpers');

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

describe("#getUserById", () => {
  it('Should return a user when given a valid email', () => {
    const user = getUserByEmail(users, "user@example.com")
    const output = {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    }

    assert.deepEqual(user, output);
  });

  it('Should return null when given an invalid email', () => {
    const user = getUserByEmail(users, "us@example.com");
    const output = undefined;

    assert.equal(user, output);
  });
});