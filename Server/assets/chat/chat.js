const socket = new WebSocket('ws://localhost:8000');
const url = window.location.href.split('/');
const chat = url[url.length - 1];
var wait;
var page = 0;

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

socket.onopen = function () {
    const session = readCookie('session')

    const auth = {
        type: 'auth',
        cookie: session,
        chat: chat
    }
    socket.send(JSON.stringify(auth))

    var historyContainer = document.getElementById("history-container")

    historyContainer.addEventListener("scroll", function (event) {
        if (historyContainer.scrollTop < 10 && !wait) {
            wait = true
            if (page > 0) {
                socket.send(JSON.stringify({ type: 'more', number: page - 1 }))
            }
        }
    })
}

socket.onmessage = function (message) {
    message = JSON.parse(message.data)

    if (message.type === 'newMessage') {
        const user = message.data.username
        var className
        var senderClassName
        if (user === chat) { 
            className = 'leftMessage' 
            senderClassName = 'leftSender'
        } else { 
            className = 'rightMessage' 
            senderClassName = 'rightSender'
        }

        var messageDiv = document.createElement('div');
        messageDiv.className = className;
        messageDiv.innerHTML = message.data.message;

        var sender = document.createElement('div');
        sender.className = senderClassName;
        sender.innerHTML = user;

        var messageContainer = document.createElement('div');
        messageContainer.className = 'messageContainer';
        messageContainer.appendChild(sender)
        messageContainer.appendChild(messageDiv)

        document.getElementById('history').appendChild(messageContainer);

        var myDiv = document.getElementById("history-container");
        myDiv.scrollTop = myDiv.scrollHeight;
    } else if (message.type === 'populate' || message.type === 'more') {
        if (message.data.type === 'end') {
            page = 0
            var messageDiv = document.createElement('div');
            messageDiv.id = 'end';
            messageDiv.innerHTML = 'End of Conversation';

            var messageContainer = document.createElement('div');
            messageContainer.className = 'messageContainer';
            messageContainer.append(messageDiv)

            document.getElementById('history').insertBefore(messageContainer, document.getElementById('history').firstChild);
        } else {
            page = message.data.number
            for (let i = message.data.messages.length - 1; i >= 0; i--) {
                const user = message.data.messages[i].username
                var className
                var senderClassName
                if (user === chat) { 
                    className = 'leftMessage' 
                    senderClassName = 'leftSender'
                } else { 
                    className = 'rightMessage' 
                    senderClassName = 'rightSender'
                }

                var messageDiv = document.createElement('div');
                messageDiv.className = className;
                messageDiv.innerHTML = message.data.messages[i].message;

                var sender = document.createElement('div');
                sender.className = senderClassName;
                sender.innerHTML = user;

                var messageContainer = document.createElement('div');
                messageContainer.className = 'messageContainer';
                messageContainer.appendChild(sender)
                messageContainer.appendChild(messageDiv)

                document.getElementById('history').insertBefore(messageContainer, document.getElementById('history').firstChild);
            }

            if (message.type === 'populate') {
                var myDiv = document.getElementById("history-container");
                myDiv.scrollTop = myDiv.scrollHeight;
            } else {
                var myDiv = document.getElementById("history-container");
                myDiv.scrollTop = 10;
            }
        }
        wait = false
    }
};

function send() {
    const text = document.getElementById('message').value

    const message = {
        type: 'message',
        chat: chat,
        message: text,
        timestamp: Date.now(),
    }

    socket.send(JSON.stringify(message))
}