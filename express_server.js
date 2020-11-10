const express = require('express');
const app = express();
const PORT  = 8080;
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

let generateRandomString =  () => {
   return Math.random().toString(36).substring(7);
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.post('/urls', (req, res) => {
  console.log(req.body)
  const shortURL = generateRandomString()  
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars)
})
app.get('/urls/new', (req, res) => {
  res.render("urls_new")
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]}
  //we are acessing the sort url as a param due to the colon in the URl
  //for the long url we are using the short url as the key in urlDatabase
  res.render("urls_show", templateVars)
})

app.post("/urls/:shortURL/delete", (req, res) => {
  console.log(urlDatabase[req.params.shortURL])
  delete urlDatabase[req.params.shortURL]

  res.redirect("/urls")
})

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
})