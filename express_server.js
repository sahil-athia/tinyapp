const express = require('express');
const app = express();
const PORT  = 8080;

app.set("view engine", "ejs")

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars)
})

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = { shortURL, longURL: urlDatabase[shortURL]}
  //we are acessing the sort url as a param due to the colon in the URl
  //for the long url we are using the short url as the key in urlDatabase
  res.render("urls_show", templateVars)
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World<b></body></html>\n')
})

app.listen(PORT, () => {
  console.log(`example app is listening on port: ${PORT}`);
})