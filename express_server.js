const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { getUserByEmail, userLogin, generateRandomString, urlsForUser, idSearch } = require('./helpers');
const app = express();
const PORT = 8080;
let possibleErrors = { e1: null, e2:null, e3:null };

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
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID"}
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(
  cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
  })
);

app.set("view engine", "ejs");

// URLS_HOME/HOMEPAGEPAGE______________________________________________________________________________________

app.get('/', (req, res) => {
  const user = users[req.session.user_id];
  if (user) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get('/urls', (req, res) => {
  const user = users[req.session.user_id];
  const ownId = urlsForUser(urlDatabase, user);
  const templateVars = { urls: urlDatabase, user, ownId };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;

  if (!longURL.startsWith(`http://`) && !longURL.startsWith(`https://`)) {
    longURL = `https://${longURL}`;
  }
  // attach the https so the shortURL redirect does not fail
  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

// REGISTER____________________________________________________________________________________________________

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const ownId = urlsForUser(urlDatabase, user);
  const templateVars = { user, ownId };

  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const {email, password} = req.body;
  const validUser = getUserByEmail(users, email);

  if (!email || !password || validUser) {
    // if the register template is empty in either fields or email exists, throw 400
    possibleErrors.e1 = true;
    res.status(400).render('urls_errors', possibleErrors);
  } else {
    const passwordHash = bcrypt.hashSync(password, 10); // hash the password enterd by user,
    users[id] = { id, email, password: passwordHash }; // create a new user in the database
    req.session['user_id'] = id;
    const ownId = urlsForUser(urlDatabase, id);
    const user = users[id];
    const templateVars = { ownId, user };

    res.render('urls_index', templateVars);
  }
});

// LOGIN_______________________________________________________________________________________________________

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const ownId = urlsForUser(urlDatabase, user);
  const templateVars = { ownId, user };
  
  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const valid = userLogin(users, email, password);

  if (valid.error) {
    possibleErrors.e3 = true;
    res.status(403).render('urls_errors', possibleErrors);
    // if either password or email dont match an error template will be shown
  } else {
    req.session['user_id'] = valid.profile.id;
    res.redirect("urls");
  }
});

// LOGOUT______________________________________________________________________________________________________

app.get('/logout', (req, res) => {
  req.session = null;
  // clear cookies on logout
  res.redirect("urls");
});

//NEW_URLS_____________________________________________________________________________________________________

app.get('/urls/new', (req, res) => {
  const user = users[req.session.user_id];
  const ownId = urlsForUser(urlDatabase, user);
  const templateVars = { ownId, user };

  if (!user) {
    possibleErrors.e2 = true;
    res.status(401).render('urls_errors', possibleErrors);
  }

  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  const ownId = urlsForUser(urlDatabase, user);
  const templateVars = { shortURL, longURL, user, ownId };
  const isUrlValid = idSearch(ownId, shortURL); 
  // will return false if the :id does not belong to the currently logged in user

  if (!user || !isUrlValid) {
    possibleErrors.e2 = true;
    res.status(401).render('urls_errors', possibleErrors);
  }
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  const user = users[req.session.user_id];

  if (!user) {
    possibleErrors.e2 = true;
    res.status(401).render('urls_errors', possibleErrors);
  }
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    // if the userid of the url does not match the current user the new url cant be created

    if (!longURL.startsWith(`http://`) && !longURL.startsWith(`https://`)) {
      longURL = `https://${longURL}`;
    }
    // attach the https so the shortURL redirect does not fail  

    urlDatabase[req.params.id] = { longURL, userID: req.session.user_id };
  } else {
    res.send("ACTION NOT PERMITTED");
  }
    
  res.redirect("/urls");
});

//SHORT_URL_REDIRECT__________________________________________________________________________________________

app.get("/u/:id", (req, res) => {
  const user = users[req.session.user_id];
  if (!user) {
    possibleErrors.e2 = true;
    res.status(401).render('urls_errors', possibleErrors);
  }
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// DELETE_URL__________________________________________________________________________________________________

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.send("ACTION NOT PERMITTED");
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
});