
function makeBuddyRequest() {
    const data = {                                                  // grab username and password
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    }



    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                          // wait for response
        // TODO add functionality
    };
}