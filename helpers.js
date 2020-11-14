const bcrypt = require('bcrypt');

const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const userLogin = (db, userEmail, userPassword) => {
  // userPassword is not hashed, confirm both email and password match
  for (const user in db) {
    if (db[user].email === userEmail) {
      if (bcrypt.compareSync(userPassword, db[user].password)) {
        let profile = db[user];
        return { error: null, profile };
      } else {
        return { error: 'Password or login was incorrect', user: null };
      }
    }
  }
  return { error: 'Password or login was incorrect', user: null };
};

const getUserByEmail = (db, userEmail) => {
  for (const user in db) {
    if (db[user].email === userEmail) {
      const profile = db[user];
      return profile;
    }
  }
  return undefined;
};

const urlsForUser = (db, id) => {
  // this function filters out the URLS that are not tied to unique user ID's
  let matchingUrls = {};
  if (id) {
    for (let urls in db) {
      if (db[urls].userID === id['id']) {
        matchingUrls[urls] = db[urls];
      }
    }
    return matchingUrls;
  }
};

const idSearch = (matchingUrls, shortURL) => {
  // this function confirms that a short url belongs to a certain user for error handling
  for (const key in matchingUrls) {
    if (key === shortURL) {
      return true;
    }
  }
  return false;
};


const addHttp = (url) => {
  if (!url.startsWith(`http://`) && !url.startsWith(`https://`)) {
    return url = `https://${url}`;
  } else {
    return url;
  }
};

module.exports = { getUserByEmail, userLogin, generateRandomString, urlsForUser, idSearch, addHttp };