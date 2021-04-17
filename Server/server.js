const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const argon2 = require('argon2')
const fs = require('fs')

const secret = '0439868ec28dab59' //crypto.randomBytes(16)          // generate random server secret key for encrypting cookies

// takes in session cookie, returns stringified json data
function decryptCookie(data) {
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

// takes in stringified user data, returns session cookie
function encryptCookie(data) {
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

// takes in username, returns session cookie
function createCookie(user) {
    const data = JSON.parse(fs.readFileSync('./userData/' + user + '.json'))
    const userData = {
        username: data.username,
        hash: data.hash
    }
    return encryptCookie(JSON.stringify(userData))
}

// takes in session cookie, return promise. resolves to user object if found, undefined it not
function findUser(session) {
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


// setting up express
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('./assets'))
app.use(cookieParser())
app.use(bodyParser.json())


// homepage
app.get('/index', (req, res) => {
    res.render('index')
})

// login page
app.get('/login', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await findUser(req.cookies.session)
    if (user) { res.redirect('/profile') }

    // otherwise, render page
    else { res.render('login') }
})

// signup page
app.get('/signup', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await findUser(req.cookies.session)
    if (user) { res.redirect('/profile') }

    // otherwise, render page
    else { res.render('signup') }
})

// profile page
app.get('/profile', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await findUser(req.cookies.session)
    if (user) { res.render('profile', { user: user }) }

    // otherwise, redirect to index
    else { res.redirect('/index') }
})

// forum page
app.get('/forum/:conversation/:page', (req, res) => {

})


// login form post req
app.post('/login', async (req, res) => {
    // grab the data
    const data = req.body

    // read the file, if error, it doesn't exist, send fail
    fs.readFile('./userData/' + data.username + '.json', async (err, user) => {
        if (err) {
            res.send('fail')
            return
        }

        // otherwise, check if passwords match
        try {
            const hash = JSON.parse(user).hash

            // compare
            if (await argon2.verify(hash, data.password)) {
                // if success, send session cookie
                res.send(createCookie(data.username))

            } else { res.send('fail') }  // otherwise, send fail


        } catch (err) { res.send('fail') }
    })
})

// signup form post req
app.post('/signup', (req, res) => {
    // grab the data
    const data = req.body

    // read the file, if error, it doesn't exist, new user can be created
    fs.access('./userData/' + data.username + '.json', async (err) => {
        if (err) {
            try {
                // hash the password
                const hash = await argon2.hash(data.password)

                // new user object
                const newUser = {
                    username: data.username,
                    hash: hash,
                    name: data.name
                }

                // save user data,  apologize if things go wrong
                fs.writeFile('./userData/' + data.username + '.json', JSON.stringify(newUser), (error) => {
                    if (error) {
                        res.send('error')
                        return
                    }

                    // otherwise, send session cookie
                    res.send(createCookie(data.username))
                })

            } catch (err) { res.send('error') }

        } else { res.send('exists') } // file could be read, therefore user alread exists, new user cannot be created
    })
})

app.listen(8080)    // start the server