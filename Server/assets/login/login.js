
function login () {
    const data = {                                                  // grab username and password
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    }

    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                          // wait for response
        if (xhr.readyState == 4) {
            const response = xhr.responseText
            if (response === 'fail') {                            // alert when there is an issue or username exists
                alert('Incorrect username or password')
            } else {
                document.cookie = "session=" + response + "; path=/; httpOnly: false";  // otherwise, set session cookie and redirect to profile
                window.location.replace('../profile')
            }
        }
    };
}