const express = require('express');
const app = express();
const PORT  = 8080;
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b></body></html>\n')
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars)
})

app.get('/urls/new', (req, res) => {
  res.render("urls_new")
})

app.post('/urls', (req, res) => {
  console.log(req.body)
  res.send("ok")
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]}
  //we are acessing the sort url as a param due to the colon in the URl
  //for the long url we are using the short url as the key in urlDatabase
  res.render("urls_show", templateVars)
})

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
})