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


function logActivity() {
    const data = {                                                  // grab data
        activityName: document.getElementById('name').value,
        mins: document.getElementById('mins').value,
        date: document.getElementById('date').value,
        desc: document.getElementById('desc').value,
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



    console.log(data)

    if (error) {
        return
    }



    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "./", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                          // wait for response
        // TODO Bennett add stuff here
    };
}