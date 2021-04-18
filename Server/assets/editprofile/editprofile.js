function previewFile() {
    const preview = document.getElementById('previewimg');
    const file = document.getElementById('image').files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        preview.src = reader.result;
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    }

}

function editProfile() {
    const file = document.getElementById('image').files[0];
    const reader = new FileReader();

    reader.addEventListener("load", function () {
        const image = reader.result

        const data = {                                                  // grab data
            name: document.getElementById('name').value,
            bio: document.getElementById('bio').value,
            image: image
        }
    
        let error = false;
    
        if (data.bio.length > 280) {
            document.getElementById('bioTooltip').textContent = "Bio is too long! Must be under 280 characters, but is " + data.bio.length + " characters long!"
            document.getElementById('bioTooltip').style.visibility = "visible"
            error = true
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
            if (xhr.readyState == 4) {
                const response = xhr.responseText
                if (response === 'error') {                            // alert when there is an issue or username exists
                    alert('There was an error editing your profile, we apologize for the inconvinience')
                } else if (response === 'success') {
                    window.location.replace('/profile')
                } 
            }
        };
    }, false);

    if (file) {
        reader.readAsDataURL(file);
    } else {
        const data = {                                                  // grab data
            name: document.getElementById('name').value,
            bio: document.getElementById('bio').value,
        }
    
        let error = false;
    
        if (data.bio.length > 280) {
            document.getElementById('bioTooltip').textContent = "Bio is too long! Must be under 280 characters, but is " + data.bio.length + " characters long!"
            document.getElementById('bioTooltip').style.visibility = "visible"
            error = true
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
            if (xhr.readyState == 4) {
                const response = xhr.responseText
                if (response === 'error') {                            // alert when there is an issue or username exists
                    alert('There was an error editing your profile, we apologize for the inconvinience')
                } else if (response === 'success') {
                    window.location.replace('/profile')
                } 
            }
        };
    }
}