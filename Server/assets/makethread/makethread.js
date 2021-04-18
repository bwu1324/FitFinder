
function makeThread() {
    const data = {                                                  // grab username and password
        title: document.getElementById('name').value,
    }

    let error = false;

    if (data.title === "") {
        document.getElementById('nameTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('nameTooltip').style.visibility = "hidden";
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
            if (response === 'error') {                            // alert when there is an issue or username exists
                document.getElementById('passwordTooltip').textContent = "Incorrect Username or Password!"
                document.getElementById('passwordTooltip').style.visibility = "visible"
            } else {
                alert(response);
                window.location.replace('../forum')
            }
        }
    };
}