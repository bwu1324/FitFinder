
function login () {
    var username = document.getElementById('username')
    var password = document.getElementByID('password')

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "./login", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        username: username,
        password: password,
    }));
}