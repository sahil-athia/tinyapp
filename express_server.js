const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { getUserByEmail, userLogin, generateRandomString, urlsForUser, idSearch, addHttp } = require('./helpers');
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
  const usersUrls = urlsForUser(urlDatabase, user);
  const templateVars = { urls: urlDatabase, user, usersUrls };
  res.render("urls_index", templateVars);
});

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  const user = users[req.session.user_id];
  let longURL = req.body.longURL;
  longURL = addHttp(longURL);
  // attach the https so the shortURL redirect does not fail

  if (!user){
    possibleErrors = { e1: true, e2:null, e3:null };
    res.status(400).render('urls_errors', possibleErrors);
  }

  urlDatabase[shortURL] = { longURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});

// REGISTER____________________________________________________________________________________________________

app.get('/register', (req, res) => {
  const user = users[req.session.user_id];
  const usersUrls = urlsForUser(urlDatabase, user);
  const templateVars = { user, usersUrls };

  if (user) {
    res.redirect('/urls');
  }
  // if user is logged in show urls not register page

  res.render('urls_register', templateVars);
});

app.post('/register', (req, res) => {
  const id = generateRandomString();
  const {email, password} = req.body;
  const validUser = getUserByEmail(users, email);

  if (!email || !password || validUser) {
    // if the register template is empty in either fields or email exists, throw 400 status error
    possibleErrors = { e1: true, e2:null, e3:null };
    res.status(400).render('urls_errors', possibleErrors);
  } else {
    const passwordHash = bcrypt.hashSync(password, 10); // hash the password enterd by user,
    users[id] = { id, email, password: passwordHash }; // create a new user in the database
    req.session['user_id'] = id;

    res.redirect('/urls');
  }
});

// LOGIN_______________________________________________________________________________________________________

app.get('/login', (req, res) => {
  const user = users[req.session.user_id];
  const usersUrls = urlsForUser(urlDatabase, user);
  const templateVars = { usersUrls, user };
  
  if (user) {
    res.redirect('/urls');
  }
  // if user is logged in show urls not login page

  res.render("urls_login", templateVars);
});

app.post('/login', (req, res) => {
  const {email, password} = req.body;
  const valid = userLogin(users, email, password);

  if (valid.error) {
    possibleErrors = { e1: null, e2:null, e3:true }
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
  const usersUrls = urlsForUser(urlDatabase, user);
  const templateVars = { usersUrls, user };

  if (!user) {
    res.redirect('/login');
  }

  res.render("urls_new", templateVars);
});

app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const shortURL = req.params.id;
  const usersUrls = urlsForUser(urlDatabase, user);
  const isUrlValid = idSearch(urlDatabase, shortURL);
  const isUrlValidToUser = idSearch(usersUrls, shortURL);
  // will return false if the :id does not belong to the currently logged in user or exist at all

  if (!user || !isUrlValidToUser || !isUrlValid) {
    // shows custom error page for corresponding error
    possibleErrors = { e1: null, e2:true, e3:null };
    res.status(401).render('urls_errors', possibleErrors);
  }

  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = { shortURL, longURL, user, usersUrls };
  // set vaiables after error checks to avoid TypeErrors

  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  const user = users[req.session.user_id];

  if (!user) {
    possibleErrors = { e1: null, e2:true, e3:null };
    res.status(401).render('urls_errors', possibleErrors);
  }
  if (urlDatabase[req.params.id].userID === req.session.user_id) {
    // if the userid of the url does not match the current user the new url cant be created

    longURL = addHttp(longURL);
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
  const shortURL = req.params.id;
  const isUrlValid = idSearch(urlDatabase, shortURL);

  if (!user || !isUrlValid) {
    possibleErrors = { e1: null, e2:'stayLogged', e3:null, user };
    res.status(401).render('urls_errors', possibleErrors);
  } else if (user && isUrlValid) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  }
  // if the user is not logged in or if the short url does not exist, show error page

});

// DELETE_URL__________________________________________________________________________________________________

app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    delete urlDatabase[req.params.shortURL];
  } else {
    possibleErrors  = { e1: null, e2:true, e3:null };
    res.status(401).render('urls_errors', possibleErrors);
  }
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
});