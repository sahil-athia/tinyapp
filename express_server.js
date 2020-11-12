const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { userExist, userLogin, generateRandomString, urlsForUser } = require('./helpers')
const app = express();
const PORT  = 8080;

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

const urlDatabase = {
 "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "12345678" },
 "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID"}
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs")



app.get('/', (req, res) => {
  res.send('Hello!')
})

// URLS_HOMEPAGE____________________________________________________________________________________________________

app.get('/urls', (req, res) => {
  const user = users[req.cookies.user_id]
  const ownId = urlsForUser(urlDatabase, user)
  const templateVars = { urls: urlDatabase, user, ownId}
  res.render("urls_index", templateVars)
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString() 
  let longURL = req.body.longURL
  console.log(longURL)
  if (!longURL.startsWith(`http://`) && !longURL.startsWith(`https://`) ){
    longURL = `https://${longURL}`
  }
  
  urlDatabase[shortURL] = { longURL, userID: req.cookies.user_id}
  res.redirect(`/urls/${shortURL}`)
})

// REGISTER____________________________________________________________________________________________________

app.get('/register', (req, res) => {
  const user = users[req.cookies.user_id]
  const ownId = urlsForUser(urlDatabase, user)
  const templateVars = { user, ownId }
  res.render('urls_register', templateVars)
})

app.post('/register', (req, res) => {
  const id = generateRandomString()

  const {email, password} = req.body
  const validUser = userExist(users, email)
  if (!email || !password || !validUser.error) {
    // if the register template is empty in either fields or email exists, throw 400
    res.send('Error: 400')
  } else {
    users[id] = { id, email, password }
    res.cookie("user_id", id)
    const ownId = urlsForUser(urlDatabase, id)
    const user = users[id]
    const templateVars = { ownId, user }
    res.render('urls_index', templateVars)
  }
})

// LOGIN_______________________________________________________________________________________________________

app.get('/login', (req, res) => {
  const user = users[req.cookies.user_id]
  const ownId = urlsForUser(urlDatabase, user)
  const templateVars = { ownId, user }
  res.render("urls_login", templateVars)
})

app.post('/login', (req, res) => {
  const {email, password} = req.body
  const valid = userLogin(users, email, password)

  if(valid.error) {
    res.send(valid.error)
  } else {
    res.cookie('user_id', valid.profile.id);
    res.redirect("urls")
  }
})

// LOGOUT______________________________________________________________________________________________________

app.get('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect("urls")
})

//____________________________________________________________________________________________________________


app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id]
  const ownId = urlsForUser(urlDatabase, user)
  const templateVars = { ownId, user }
  res.render("urls_new", templateVars)
})

app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL
  console.log(longURL)
  if (!longURL.startsWith(`http://`) && !longURL.startsWith(`https://`) ){
    longURL = `https://${longURL}`
  }
  urlDatabase[req.params.id] = { longURL, userID: req.cookies.user_id}
  res.redirect("/urls");
})

app.get('/urls/:shortURL', (req, res) => {
  const user = users[req.cookies.user_id]
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL
  const ownId = urlsForUser(urlDatabase, user)
  const templateVars = { shortURL, longURL, user, ownId}
  //we are acessing the sort url as a param due to the colon in the URl
  //for the long url we are using the short url as the key in urlDatabase
  res.render("urls_show", templateVars)
})

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
  // redirects require a http:// in order to work.
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL]

  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
})