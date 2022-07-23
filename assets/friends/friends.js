function sendRequest () {
    const data = {  
        request: document.getElementById('request').value,
    }

    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "/reqFriend", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                           // wait for response
        if (xhr.readyState == 4) {
            const response = xhr.responseText
            if (response === 'error') {                            // alert when there is an issue or username exists
                alert('There was an error with the friend request, we apologize for the inconvinience')
                window.location.replace('/friends')
            } else if (response === 'notfound') {
                alert('Friend does not exist')
                window.location.replace('/friends')
            } else {
                alert('Sent')
                window.location.replace('/friends')
            }
        }
    };
}

function acceptRequest (username) {
    const data = {  
        request: username
    }

    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "/acceptFriend", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                           // wait for response
        if (xhr.readyState == 4) {
            const response = xhr.responseText
            if (response === 'error') {                            // alert when there is an issue or username exists
                alert('There was an error with the friend request, we apologize for the inconvenience')
                window.location.replace('/friends')
            } else if (response === 'notfound') {
                alert('Friend does not exist')
                window.location.replace('/friends')
            } else {
                alert('Accepted')
                window.location.replace('/friends')
            }
        }
    };
}