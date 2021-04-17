const WebSocket = require('ws')
const crypto = require('crypto')
const fs = require('fs')

var secret
process.on('message', (data) => { secret = data })

function decryptCookie(data) {
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
                        resolve('undefined')
                        return
                    }
                    resolve(JSON.parse(data))
                })
            })
        } catch { resolve(undefined) }
    })
}

const wsserver = new WebSocket.Server({ port: 8000 })
wsserver.on('connection', (socket, req) => {
    var username;
    socket.onmessage = async function (message) {
        try {
            const data = JSON.parse(message.data)
            
            if (data.type === 'auth') {
                const user = await findUser(data.cookie)
                if (!user) { socket.close() }
            } else if (data.type === 'message') {

            }
        } catch {
            socket.close()
        }
    }

    socket.onclose = function () {
    }

    socket.onerror = function () {

    }
})