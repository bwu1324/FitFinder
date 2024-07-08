const express = require('express')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const crypto = require('crypto')
const argon2 = require('argon2')
const fs = require('fs')
const { fork } = require('child_process');
const dotenv = require('dotenv');
dotenv.config()

const secret = crypto.randomBytes(32)        // generate random server secret key for encrypting cookies

// takes in session cookie, returns stringified json data
function decryptCookie(data) {
    try {
        data = JSON.parse(Buffer.from(data, 'base64').toString('ascii'))
        const iv = Buffer.from(data.iv)
        const auth = Buffer.from(data.auth)
        const decipher = crypto.createDecipheriv('aes-256-gcm', secret, iv)
        decipher.setAuthTag(auth)
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
        const cipher = crypto.createCipheriv('aes-256-gcm', secret, iv)

        let encrypted = cipher.update(data, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        const auth = cipher.getAuthTag();

        return Buffer.from(JSON.stringify({ data: encrypted, iv, auth })).toString('base64')
    } catch (error) {
        return undefined
    }
}

// takes in username, returns session cookie
function createCookie(user) {
    const data = JSON.parse(fs.readFileSync('./data/userData/' + user + '.json'))
    const userData = {
        username: data.username,
        hash: data.hash
    }
    return encryptCookie(JSON.stringify(userData))
}

// takes in session cookie, return promise. resolves to user object if found, undefined it not
function authUser(session) {
    return new Promise((resolve) => {
        try {
            const user = JSON.parse(decryptCookie(session))
            fs.access('./data/userData/' + user.username + '.json', (err) => {
                if (err) {
                    resolve(undefined)
                    return
                }
                fs.readFile('./data/userData/' + user.username + '.json', (error, data) => {
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

function findUser(username) {
    return new Promise((resolve) => {
        try {
            fs.access('./data/userData/' + username + '.json', (err) => {
                if (err) {
                    resolve(undefined)
                    return
                }
                fs.readFile('./data/userData/' + username + '.json', (error, data) => {
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

function sha(input) { return crypto.createHash('sha256').update(input).digest('hex') }

function save_img(fileName, img) {
    const ext = img.split(';')[0].match(/jpeg|png|gif/)[0];
    const data = img.replace(/^data:image\/\w+;base64,/, "");
    const buf = new Buffer.from(data, 'base64');
    const path = './assets/global/imgs/' + fileName + '.' + ext;
    fs.writeFile(path, buf, () => { });
    return path.replace('./assets', '');
}

// setting up express
const app = express()

app.set('view engine', 'ejs')
app.use(express.static('./assets'))
app.use(cookieParser())
app.use(bodyParser.json({ limit: '100mb' }))

app.get('/', (req, res) => {
    res.redirect('/index')
})

// homepage
app.get('/index', (req, res) => {
    res.render('index')
})

// login page
app.get('/login', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await authUser(req.cookies.session)
    if (user) { res.redirect('/profile') }

    // otherwise, render page
    else { res.render('login') }
})

// signup page
app.get('/signup', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await authUser(req.cookies.session)
    if (user) { res.redirect('/profile') }

    // otherwise, render page
    else { res.render('signup') }
})

// profile page
app.get('/profile', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await authUser(req.cookies.session)
    if (user) { res.render('profile', { user: user }) }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

// profile edit page
app.get('/editprofile', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await authUser(req.cookies.session)
    if (user) { res.render('editprofile', { user: user }) }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

// logger
app.get('/logger', async (req, res) => {
    // check if user has valid session cookie, send forum if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        res.render('logger', { log: user.log })
    }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

app.get('/activitylogger', (req, res) => {
    res.render('activitylogger')
})

// forum page
app.get('/forum', (req, res) => {
    res.render('forumHome')
})

app.get('/forum/:conversation/:page', async (req, res) => {
    // check if user has valid session cookie, send forum if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        res.render('forum', { friends: user.friends })
    }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

// friends page
app.get('/friends', async (req, res) => {
    // check if user has valid session cookie, send forum if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        var friendRequests = []
        for (let i = 0; i < user.requests.length; i++) {
            var request = await findUser(user.requests[i])
            friendRequests.push(request)
        }

        var friends = []
        for (let i = 0; i < user.friends.length; i++) {
            var request = await findUser(user.friends[i])
            friends.push(request)
        }
        res.render('friends', { friendRequests: friendRequests, friends: friends })
    }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

// find a buddy page
app.get('/buddy', async (req, res) => {
    // check if user has valid session cookie, send forum if yes
    const user = await authUser(req.cookies.session)

    if (user) {
        res.render('buddy')
    }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

app.get('/findbuddy', async (req, res) => {
    // check if user has valid session cookie, send forum if yes
    const user = await authUser(req.cookies.session)

    if (user) {
        fs.readdir('./data/userData/', async (err, files) => {
            var users = []
            for (let i = 0; i < files.length; i++) {
                users.push(findUser(files[i].split('.')[0]))
            }

            var match = []
            for (let i = 0; i < users.length; i++) {
                var thisUser = await users[i]
                if (thisUser && thisUser.username !== user.username) {
                    for (let j = 0; j < thisUser.posts.length; j++) {
                        if (thisUser.posts[j].zip === user.zip) {
                            match.push(Object.assign(thisUser.posts[j], thisUser))
                        }
                    }
                }
            }

            res.render('findbuddy', { match: match })
        })
    }

    // otherwise, redirect to signup
    else { res.render('signup') }
})

// chat page
app.get('/chat/', async (req, res) => {
    // check if user has valid session cookie, send chat page if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const friends = [];
        for (let i = 0; i < user.friends.length; i++) {
            friends.push(new Promise((resolve, reject) => {
                fs.readFile('./data/userData/' + user.friends[i] + '.json', async (err, user) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(JSON.parse(user));
                })
            }));
        }
        for (let i = 0; i < friends.length; i++) friends[i] = await friends[i];

        res.render('chatClosed', { friends })
    }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

app.get('/chat/:friend', async (req, res) => {
    // check if user has valid session cookie, send chat page if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const friends = [];
        for (let i = 0; i < user.friends.length; i++) {
            friends.push(new Promise((resolve, reject) => {
                fs.readFile('./data/userData/' + user.friends[i] + '.json', async (err, user) => {
                    if (err) {
                        return reject(err);
                    }
                    resolve(JSON.parse(user));
                })
            }));
        }
        for (let i = 0; i < friends.length; i++) friends[i] = await friends[i];


        res.render('chatOpen', { friends, ws_url: process.env.WS_URL })
    }

    // otherwise, redirect to signup
    else { res.redirect('/signup') }
})

// login form post req
app.post('/login', async (req, res) => {
    // grab the data
    const data = req.body

    // read the file, if error, it doesn't exist, send fail
    fs.readFile('./data/userData/' + data.username + '.json', async (err, user) => {
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
    fs.access('./data/userData/' + data.username + '.json', async (err) => {
        if (err) {
            try {
                // hash the password
                const hash = await argon2.hash(data.password)

                // new user object
                const newUser = {
                    username: data.username,
                    hash: hash,
                    name: data.name,
                    profile_image: '../global/default.png',
                    zip: data.zip,
                    weight: data.weight,
                    bio: "Edit your profile to set your bio",
                    friends: [],
                    posts: [],
                    requests: [],
                    log: []
                }

                // save user data,  apologize if things go wrong
                fs.writeFile('./data/userData/' + data.username + '.json', JSON.stringify(newUser), (error) => {
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

// forum post reqs
app.post('/newThread', async (req, res) => {
    // check if user has valid session cookie, keep going if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const data = req.body
    }

    // send error
    else { res.send('signup') }
})

app.post('/newComment', async (req, res) => {
    // check if user has valid session cookie, keep going if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const data = req.body
    }

    // send error
    else { res.send('error') }
})

// new friend post req
app.post('/reqFriend', async (req, res) => {
    // check if user has valid session cookie, keep going if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const data = req.body

        const newFriend = await findUser(data.request)
        if (newFriend) {
            var found = false
            for (let i = 0; i < newFriend.requests.length; i++) {
                if (newFriend.requests[i] === user.username) {
                    found = true
                    res.send('sent')
                }
            }

            for (let i = 0; i < newFriend.friends.length; i++) {
                if (newFriend.friends[i] === user.username) {
                    found = true
                    res.send('sent')
                }
            }

            if (!found && user.username !== data.request) {
                newFriend.requests.push(user.username)
                fs.writeFile('./data/userData/' + newFriend.username + '.json', JSON.stringify(newFriend), () => { })
                res.send('sent')
            } else { res.send('notfound') }
        } else { res.send('notfound') }
    }

    // send error
    else { res.send('error') }
})

// accept friend post req
app.post('/acceptFriend', async (req, res) => {
    // check if user has valid session cookie, keep going if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const data = req.body

        const newFriend = await findUser(data.request)
        if (newFriend) {
            for (let i = 0; i < user.requests.length; i++) {
                if (user.requests[i] === data.request) {
                    user.requests.splice(i)
                }
            }

            for (let i = 0; i < newFriend.requests.length; i++) {
                if (newFriend.requests[i] === user.username) {
                    newFriend.requests.splice(i)
                }
            }
            user.friends.push(data.request)
            newFriend.friends.push(user.username)

            fs.writeFile('./data/userData/' + user.username + '.json', JSON.stringify(user), () => { })
            fs.writeFile('./data/userData/' + newFriend.username + '.json', JSON.stringify(newFriend), () => { })

            // calculate name of conversation
            var chatID
            if (newFriend.username > user.username) { chatID = newFriend.username + user.username }
            else { chatID = user.username + newFriend.username }
            chatID = sha(chatID)

            // create directory for conversation
            fs.mkdir('./data/conversations/' + chatID, () => {
                const newFile0 = { type: 'end' }
                fs.writeFile('./data/conversations/' + chatID + '/0.json', JSON.stringify(newFile0), () => { })

                const newFile1 = { type: 'messages', users: [user.username, data.request], number: 1, messages: [] }
                fs.writeFile('./data/conversations/' + chatID + '/1.json', JSON.stringify(newFile1), () => { })
            })
            res.send('success')
        } else { res.send('error') }
    }

    // send error
    else { res.send('error') }
})

// profile edit post req
app.post('/editprofile', async (req, res) => {
    // check if user has valid session cookie, redirect to profile if yes
    const user = await authUser(req.cookies.session)
    if (user) {
        const data = req.body

        if (data.bio) { user.bio = data.bio }
        if (data.name) { user.name = data.name }
        if (data.image) {
            const path = save_img(user.username, data.image)
            user.profile_image = path;
        }

        fs.writeFile('./data/userData/' + user.username + '.json', JSON.stringify(user), (error) => {
            if (error) {
                res.send('error')
                return
            }

            res.send('success')
        })
    }

    // otherwise, redirect to signup
    else { res.send('error') }
})

// find buddy post req
app.post('/buddy', async (req, res) => {
    const user = await authUser(req.cookies.session)
    if (user) {
        var data = req.body
        data.username = user.username
        data.zip = user.zip
        user.posts.push(data)

        fs.writeFile('./data/userData/' + user.username + '.json', JSON.stringify(user), (error) => {
            if (error) {
                res.send('error')
                return
            }

            res.send('success')
        })
    }

    // otherwise, redirect to signup
    else { res.send('error') }
})

// activity logger post req
app.post('/activitylogger', async (req, res) => {
    const user = await authUser(req.cookies.session)
    if (user) {
        try {
            const data = req.body
            const fileName = sha(user.username + Date.now())
            const path = save_img(fileName, data.image)

            var splitDate = data.date.split('-')
            const newLog = {
                activityName: data.activityName,
                mins: parseInt(data.mins),
                date: splitDate[1] + '/' + splitDate[2] + '/' + splitDate[0],
                description: data.description,
                image: path
            }

            user.log.push(newLog)
            fs.writeFile('./data/userData/' + user.username + '.json', JSON.stringify(user), () => { })
            res.send('logged')
        } catch (error) { res.send('error') }
    }

    // otherwise, redirect to signup
    else { res.send('error') }
})

// logger data post req
app.post('/loggerdata', async (req, res) => {
    const user = await authUser(req.cookies.session)
    if (user) {
        res.send(JSON.stringify({ data: user.log }))
    }

    // otherwise, redirect to signup
    else { res.send('error') }
})



app.listen(8080)    // start the server

const websocket = fork('./websocket.js')
websocket.send(secret.toString('hex'))

