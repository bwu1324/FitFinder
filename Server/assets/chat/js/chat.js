const socket = new WebSocket('ws://localhost:8000');


function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

socket.onopen = function () {
    const session = readCookie('session')
    
    const auth = {
        type: 'auth',
        cookie: session
    }
    socket.send(JSON.stringify(auth))
}

socket.onmessage = function (message) {
    console.log(message.data);
};

function send () {
    const text = document.getElementById('message').value

    const message = {
        type: 'message',
        data: text
    }
    console.log(message)

    socket.send(JSON.stringify(message))
}
