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

function check() {
    const data = {                                                  // grab data
        activityName: document.getElementById('name').value,
        mins: document.getElementById('mins').value,
        date: document.getElementById('date').value,
        description: document.getElementById('desc').value,
        image: document.getElementById('image').value
    }

    let error = false;

    if (document.getElementById('image').value === "") {
        document.getElementById('imgTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('imgTooltip').style.visibility = "hidden";
    }

    if (data.activityName === "") {
        document.getElementById('nameTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('nameTooltip').style.visibility = "hidden";
    }

    if (data.mins === "") {
        document.getElementById('timeTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('timeTooltip').style.visibility = "hidden";
    }

    if (data.date === "") {
        document.getElementById('dateTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('dateTooltip').style.visibility = "hidden";
    }

    return error;

}

function logActivity() {
    err = check();
    console.log("hi")
    if (err) {
        console.log(err);
        return
    }
    console.log("hihi");
    const reader = new FileReader();
    const file = document.getElementById('image').files[0];

    const data = {}

    reader.addEventListener("load", function () {
        const image = reader.result

        const data = {                                                  // grab data
            activityName: document.getElementById('name').value,
            mins: document.getElementById('mins').value,
            date: document.getElementById('date').value,
            description: document.getElementById('desc').value,
            image: image
        }
    

    

    
        console.log(image)
    

    
    
    
        var xhr = new XMLHttpRequest();                                 // create http request and send it
        xhr.open("POST", "/activitylogger", true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    
        xhr.onreadystatechange = function () {                          // wait for response
            if (xhr.readyState == 4) {
                const response = xhr.responseText
                if (response === 'error') {                            // alert when there is an issue or username exists
                    alert('There was an error with the friend request, we apologize for the inconvinience')
                    window.location.replace('/activitylogger')
                } else {
                    window.location.replace('/logger')
                }
            }
        };
    }, false);



    if (file) {
        reader.readAsDataURL(file);
    }
}