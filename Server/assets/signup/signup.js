
function signup() {
    const data = {                                                  // grab form data
        username: document.getElementById('username').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmpassword').value,
        name: document.getElementById('nameField').value,
        zip: document.getElementById('zipField').value,
        weight: document.getElementById('weightField').value,
    }

    console.log(data)

    let error = false;

    if (data.zip === "" || data.weight === "") {
        document.getElementById('numTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('numTooltip').style.visibility = "hidden";
    }

    if (data.name === "") {
        document.getElementById('nameTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('nameTooltip').style.visibility = "hidden";
    }

    if (data.username === "") {
        document.getElementById('usernameTooltip').textContent = "Username cannot be blank!"
        document.getElementById('usernameTooltip').style.visibility = "visible";
        error = true;
    } else {
        document.getElementById('usernameTooltip').style.visibility = "hidden";
    }

    if (data.password.length < 8) {
        document.getElementById('passwordTooltip').style.visibility = "visible";
        error = true;
    } else {
        document.getElementById('passwordTooltip').style.visibility = "hidden";
    }

    if (data.confirmPassword !== data.password) {
        document.getElementById('confirmPasswordTooltip').style.visibility = "visible";
        error = true;
    } else {
        document.getElementById('confirmPasswordTooltip').style.visibility = "hidden";
    }


    if (error) {
        return
    }



    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                           // wait for response
        if (xhr.readyState == 4) {
            const response = xhr.responseText
            if (response === 'error') {                            // alert when there is an issue or username exists
                alert('There was an error with creating your account, we apologize for the inconvinience')
            } else if (response === 'exists') {
                document.getElementById('usernameTooltip').textContent = "An account with this username already exists!"
                document.getElementById('usernameTooltip').style.visibility = "visible"
            } else {
                document.cookie = "session=" + response + "; path=/; httpOnly: false";  // otherwise, set session cookie and redirect to profile
                window.location.replace('../profile')
            }
        }
    };
}