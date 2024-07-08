const WebSocket = require('ws')
const crypto = require('crypto')
const fs = require('fs')

var secret
process.on('message', (data) => { secret = Buffer.from(data, 'hex') })

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

// takes in session cookie, return promise. resolves to user object if found, undefined it not
function findUser(session) {
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
                        resolve('undefined')
                        return
                    }
                    resolve(JSON.parse(data))
                })
            })
        } catch { resolve(undefined) }
    })
}

function sha(input) { return crypto.createHash('sha256').update(input).digest('hex') }

var loggedIn = []
const wsserver = new WebSocket.Server({ port: 8000 }) // create websocket server
wsserver.on('connection', (socket) => {
    var username;
    var chatID;

    socket.onmessage = async function (message) {
        try {
            // parse the data
            const data = JSON.parse(message.data)
            if (data.type === 'auth') {
                // find user and close socket if not found
                const user = await findUser(data.cookie)
                if (!user) {
                    socket.close()
                    return
                }

                // set data for this socket and add them to logged in users
                username = user.username
                loggedIn.push({ username: username, socket: socket, chat: data.chat })

                // calculate name of conversation
                if (data.chat > username) { chatID = data.chat + username }
                else { chatID = username + data.chat }
                chatID = sha(chatID)

                // read the folder of that conversation
                fs.readdir('./data/conversations/' + chatID, (err, files) => {
                    if (err) {
                        socket.send(JSON.stringify({ type: 'error' }))
                        return
                    }

                    // find the largest number in the list
                    var max = 1
                    for (let i = 0; i < files.length; i++) {
                        const index = parseInt(files[i])
                        if (index > 0) { max = index }
                    }

                    // read that file
                    fs.readFile('./data/conversations/' + chatID + '/' + files[max], (error, data) => {
                        if (error) {
                            socket.send(JSON.stringify({ type: 'error' }))
                            return
                        }

                        const history = {
                            type: 'populate',
                            data: JSON.parse(data)
                        }
                        socket.send(JSON.stringify(history)) // and send it

                        // then read the file right before it
                        fs.readFile('./data/conversations/' + chatID + '/' + files[max - 1], (errored, data) => {
                            if (errored) {
                                socket.send(JSON.stringify({ type: 'error' }))
                                return
                            }

                            const history = {
                                type: 'populate',
                                data: JSON.parse(data)
                            }

                            socket.send(JSON.stringify(history)) // and send it as well
                        })
                    })
                })
            } else if (data.type === 'message') {
                // read the folder of that conversation
                fs.readdir('./data/conversations/' + chatID, (er, files) => {
                    if (er) {
                        socket.send(JSON.stringify({ type: 'error' }))
                        return
                    }

                    // find the largest number in the list
                    var max = 0
                    for (let i = 0; i < files.length; i++) {
                        const index = parseInt(files[i])
                        if (index > 0) { max = index }
                    }

                    // read that file
                    fs.readFile('./data/conversations/' + chatID + '/' + files[max], (err, chatData) => {
                        if (err) {
                            socket.send(JSON.stringify({ type: 'error' }))
                            return
                        }

                        // parse the data
                        var chat = JSON.parse(chatData)

                        // add the new message to list
                        const newMessage = {
                            username: username,
                            timestamp: data.timestamp,
                            message: data.message
                        }
                        const notification = {
                            type: 'newMessage',
                            data: newMessage
                        }
                        chat.messages.push(newMessage)

                        // save the file
                        fs.writeFile('./data/conversations/' + chatID + '/' + files[max], JSON.stringify(chat), (error) => {
                            if (error) {
                                socket.send(JSON.stringify({ type: 'error' }))
                                return
                            }

                            // if the other person in the conversation is logged in, send data there as well
                            var i = 0
                            while (i < loggedIn.length) {
                                if (loggedIn[i].username === data.chat && loggedIn[i].chat === username) {
                                    loggedIn[i].socket.send(JSON.stringify(notification))
                                    i = loggedIn.length
                                }
                                i++
                            }

                            // send that data to the user ofc
                            socket.send(JSON.stringify(notification))
                        })

                        // if the length is greater than 20 now, create new file for history
                        if (chat.messages.length > 20) {
                            const fileName = max + 1
                            const newFile = { type: 'messages', users: [username, data.chat], number: fileName, messages: [] }
                            fs.writeFile('./data/conversations/' + chatID + '/' + fileName + '.json', JSON.stringify(newFile), () => { })
                        }
                    })
                })
            } else if (data.type === 'more') {
                fs.readFile('./data/conversations/' + chatID + '/' + data.number + '.json', (error, data) => {
                    if (error) {
                        socket.send(JSON.stringify({ type: 'error' }))
                        return
                    }
                    const history = {
                        type: 'more',
                        data: JSON.parse(data)
                    }
                    socket.send(JSON.stringify(history))
                })
            } else { // if this is an unexpected message, close the connection
                socket.close()
            }
        } catch {   // if error, close the connection
            socket.close()
        }
    }

    socket.onclose = function () {
        // when socket is closed, remove that user from logged in users
        var i = 0;
        while (i < loggedIn.length) {
            if (username === loggedIn[i].username) {
                loggedIn.splice(i)
                i = loggedIn.length
            }
            i++
        }
    }

    socket.onerror = function () {
        // close socket if error occurs
        socket.close()
    }
})