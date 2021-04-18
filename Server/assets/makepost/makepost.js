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


function makePost() {
    const data = {                                                  // grab data
        caption: document.getElementById('capt').value
    }

    let error = false;

    if (document.getElementById('image').value === "") {
        document.getElementById('imgTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('imgTooltip').style.visibility = "hidden";
    }

    if (data.caption === "") {
        document.getElementById('captTooltip').style.visibility = "visible";
        error = true;
    }
    else {
        document.getElementById('captTooltip').style.visibility = "hidden";
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