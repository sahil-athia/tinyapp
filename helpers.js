const generateRandomString =  () => {
  return Math.random().toString(36).substring(7);
};

const userLogin = (db, userEmail, userPassword) => {
  for (const user in db) {
    if (db[user].email === userEmail) {
      if (db[user].password === userPassword) {
        let profile = db[user]
        return { error: null, profile }
      } else {
        return { error: 'Error: 403, password or login was incorrect', user: null }
      }
    }
  }
  return { error: 'Error: 403, password or login was incorrect', user: null }
}

const userExist = (db, userEmail) => {
  for (const user in db) {
    if (db[user].email === userEmail) {
      let profile = db[user]
      return { error: null, profile, }
    }
  }
  return { error: 'email', user: null }
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

module.exports = { userExist, userLogin, generateRandomString, urlsForUser }