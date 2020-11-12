const bcrypt = require('bcrypt')

const generateRandomString =  () => {
  return Math.random().toString(36).substring(7);
};

const userLogin = (db, userEmail, userPassword) => {
  // userPassword is not hashed
  for (const user in db) {
    if (db[user].email === userEmail) {
      if (bcrypt.compareSync(userPassword, db[user].password)) {
        let profile = db[user]
        return { error: null, profile }
      } else {
        return { error: 'Password or login was incorrect', user: null }
      }
    }
  }
  return { error: 'Password or login was incorrect', user: null }
}

const getUserByEmail = (db, userEmail) => {
  for (const user in db) {
    if (db[user].email === userEmail) {
      const profile = db[user]
      return profile
    }
  }
  return undefined 
}

const urlsForUser = (db, id) => {
  let matchingUrls = {}
  if (id){
    for (let urls in db) {
      if (db[urls].userID === id['id']) {
        matchingUrls[urls] = db[urls]
      }
    }
    return matchingUrls
  }  
}

module.exports = { getUserByEmail, userLogin, generateRandomString, urlsForUser }