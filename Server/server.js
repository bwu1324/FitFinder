const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const argon2 = require('argon2')
const fs = require('fs')

const secret = '0439868ec28dab59' //crypto.randomBytes(16)

function decryptCookie(data) {              // takes in session cookie, returns stringified json data
    try {
        data = JSON.parse(Buffer.from(data, 'base64').toString('ascii'))
        const iv = Buffer.from(data.iv)
        const decipher = crypto.createDecipheriv('aes-128-cbc', secret, iv)

        let decrypted = decipher.update(data.data, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (error) {
        return undefined
    }
}

function encryptCookie(data) {              // takes in stringified user data, returns session cookie
    try {
        const iv = crypto.randomBytes(16)
        const cipher = crypto.createCipheriv('aes-128-cbc', secret, iv)

        let encrypted = cipher.update(data, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return Buffer.from(JSON.stringify({ data: encrypted, iv: iv })).toString('base64')
    } catch (error) {
        return undefined
    }
}

function createCookie(user) {               // takes in username, returns session cookie
    const data = JSON.parse(fs.readFileSync('./userData/' + user + '.json'))
    const userData = {
        username: data.username,
        hash: data.hash
    }
    return encryptCookie(JSON.stringify(userData))
}

function findUser(session) {                // takes in session cookie, return promise. resolves to user object if found, undefined it not
    return new Promise((resolve) => {
        try {
            const user = JSON.parse(decryptCookie(session))
            fs.access('./userData/' + user.username + '.json', (err) => {
                if (err) {
                    resolve(undefined)
                    return
                }
                fs.readFile('./userData/' + user.username + '.json', (error, data) => {
                    if (error) {
                        resolve(undefined)
                        return
                    }
                    resolve(JSON.parse(data))
                })
            })
        } catch { resolve(undefined) }
    })
}

const app = express()

app.set('view engine', 'ejs')

app.use(express.static('./assets'))
app.use(cookieParser())
app.use(bodyParser.json())


app.get('/index', (req, res) => {            // homepage
    res.render('index')
})

app.get('/login', async (req, res) => {      // login page
    const user = await findUser(req.cookies.session)    // check if user has valid session cookie, redirect to profile if yes
    if (user) { res.redirect('/profile') }
    else { res.render('login') }                        // otherwise, render page
})

app.get('/signup', async (req, res) => {
    const user = await findUser(req.cookies.session)    // check if user has valid session cookie, redirect to profile if yes
    if (user) { res.redirect('/profile') }
    else { res.render('signup') }                       // otherwise, render page
})

app.get('/profile', async (req, res) => {
    const user = await findUser(req.cookies.session)    // check if user has valid session cookie, redirect to profile if yes
    if (user) { res.render('profile', { user: user }) }
    else { res.redirect('/index') }                     // otherwise, redirect to index
})


app.post('/login', async (req, res) => {                // login form post req
    const data = req.body                                   // grab the data
    fs.readFile('./userData/' + data.username + '.json', async (err, user) => {
        if (err) {                                          // read the file, if error, it doesn't exist, send fail
            res.send('fail')
            return
        }
        try {                                               // otherwise, check if passwords match
            const hash = JSON.parse(user).hash                  // hash stored in database

            if (await argon2.verify(hash, data.password)) {     // compare
                res.send(createCookie(data.username))               // if success, send session cookie

            } else { res.send('fail') }                             // otherwise, send fail


        } catch (err) { res.send('fail') }
    })
})

app.post('/signup', (req, res) => {                     // signup form post req
    const data = req.body                                   // grab the data

    fs.access('./userData/' + data.username + '.json', async (err) => {
        if (err) {                                          // read the file, if error, it doesn't exist, new user can be created
            try {
                const hash = await argon2.hash(data.password)    // hash the password

                const newUser = {                                // new user object
                    username: data.username,
                    hash: hash,
                    name: data.name
                }

                fs.writeFile('./userData/' + data.username + '.json', JSON.stringify(newUser), (error) => {
                    if (error) {                                 // save user data
                        res.send('error')                            // apologize if things go wrong
                    }

                    res.send(createCookie(data.username))             // send session cookie
                })

            } catch (err) { res.send('error') }

        } else { res.send('exists') }                       // file could be read, therefore user alread exists, new user cannot be created
    })
})

app.listen(8080)