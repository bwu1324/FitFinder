
function login () {
    var username = document.getElementById('username').value
    var password = document.getElementById('password').value
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        username: username,
        password: password
    }));
}