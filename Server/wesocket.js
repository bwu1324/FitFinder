const WebSocket = require('ws')

const wsserver = new WebSocket.Server({ port: 8000 })
wsserver.on('connection', (socket, req) => {
    socket.onmessage = function (message) {
        try {
            const data = JSON.parse(message)
            
        } catch {
            socket.close()
        }
    }

    socket.onclose = function () {

    }

    socket.onerror = function () {

    }
})