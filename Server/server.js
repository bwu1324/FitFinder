const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto')


const app = express();

app.set('view engine', 'ejs');

app.use(express.static('./assets'));
app.use(cookieParser());
app.use(bodyParser.json());

app.get('/login', (req, res) => {
    res.render('login')
});


app.post('/login', (req, res) => {
    const data = JSON.parse(req.body)
})

app.get('/signup', (req, res) => {
    res.render('signup')
})

app.post('/signup', (req, res) => {

})

app.listen(8080);