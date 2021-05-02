
function login () {
    const data = {                                                  // grab username and password
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    }

    let error = false;

    if (data.username === "") {
        document.getElementById('usernameTooltip').textContent = "Username cannot be blank!"
        document.getElementById('usernameTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('usernameTooltip').style.visibility = "hidden";
    }
    if (error) {
        return
    }

    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                          // wait for response
        if (xhr.readyState == 4) {
            const response = xhr.responseText
            if (response === 'fail') {                            // alert when there is an issue or username exists
                document.getElementById('passwordTooltip').textContent = "Incorrect Username or Password!"
                document.getElementById('passwordTooltip').style.visibility = "visible"
            } else {
                document.cookie = "session=" + response + "; path=/; httpOnly: false";  // otherwise, set session cookie and redirect to profile
                window.location.replace('../profile')
            }
        }
    };
}