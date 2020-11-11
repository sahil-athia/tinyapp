const express = require('express');
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const app = express();
const PORT  = 8080;

let generateRandomString =  () => {
  return Math.random().toString(36).substring(7);
};

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
 "b2xVn2": "http://www.lighthouselabs.ca",
 "9sm5xK": "http://www.google.com"
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs")



app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username}
  res.render("urls_index", templateVars)
})

app.get('/register', (req, res) => {
  res.render('urls_register')
})

app.post('/register', (req, res) => {
  const id = generateRandomString()
  const {email, password} = req.body
  users[id] = { id, email, password }
  res.cookie("user_id", id)
  console.log(users[id])
  res.redirect('/urls')
})

app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  if (!req.body.username) {
    res.clearCookie('username');
  }
  res.redirect("urls");
})

app.post('/urls', (req, res) => {
  const shortURL = generateRandomString()  
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
})


app.get('/urls/new', (req, res) => {
  const templateVars = {username: req.cookies.username}
  res.render("urls_new", templateVars)
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL], username: req.cookies.username}
  //we are acessing the sort url as a param due to the colon in the URl
  //for the long url we are using the short url as the key in urlDatabase
  res.render("urls_show", templateVars)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  // console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL]

  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
})