
function profileEdit() {
    const data = {                                                  // grab username and password
        name: document.getElementById('name').value,
        bio: document.getElementById('bio').value
    }

    let error = false;

    if (data.bio.length > 280) {
        document.getElementById('bioTooltip').textContent = "Bio is too long! Must be under 280 characters, but is " + data.bio.length + " characters long!"
        document.getElementById('bioTooltip').style.visibility = "visible"
    }
    else {
        document.getElementById('bioTooltip').style.visibility = "hidden"
    }
    if (error) {
        return
    }

    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                          // wait for response
        // TODO Button does nothing right now
    };
}