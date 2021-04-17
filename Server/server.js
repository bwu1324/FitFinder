const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const argon2 = require('argon2');
const fs = require('fs');

const secret = crypto.randomBytes(16);

function decryptCookie (data) {
    try {
        data = JSON.parse(Buffer.from(data, 'base64').toString('ascii'))
        const iv = Buffer.from(data.iv)
        const decipher = crypto.createDecipheriv('aes-128-cbc', secret, iv)

        let decrypted = decipher.update(data.data, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (error) {
        return error
    }
}

function encryptCookie (data) {
    try {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-128-cbc', secret, iv)

        let encrypted = cipher.update(data, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return Buffer.from(JSON.stringify({ data: encrypted, iv: iv })).toString('base64')
    } catch (error) {
        return error
    }
}

function createCookie (user) {
    const data = JSON.parse(fs.readFileSync('./userData/' + user + '.json'))
    const userData = {

    }
    return encryptCookie (userData)
}

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('./assets'));
app.use(cookieParser());
app.use(bodyParser.json());

app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));


app.post('/login', (req, res) => {
    const data = req.body
    console.log(data)
})

app.post('/signup', async (req, res) => {
    const data = req.body

    try {
        const hash = await argon2.hash(data.password);

        const newUser = {
            username: data.username,
            hash: hash,
            name: data.name
        }

        fs.writeFile('./userData/' + data.username + '.json', JSON.stringify(newUser), (error) => {
            if (error) { res.render('error', { type: 'writefailed' }) }

            res.cookie('session', createCookie(data.username) )
            res.render('profile', { type: 'saveuserfailed' })
        })
    } catch (err) { res.render('error', { type: 'hashfailed' }) }
})

app.listen(8080);