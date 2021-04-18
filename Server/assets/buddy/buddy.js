function postBuddyRequest () {
    try {
        const endDate = document.getElementById('endDate').value        // convert to unix dates
        var endUnix = new Date(endDate.split('T')[0]).getTime()
    
        var endTime = endDate.split('T')[1]
        endTime = endTime.split(':')
        endUnix += endTime[0] * 3600
        endUnix += endTime[1] * 60
    
        const startDate = document.getElementById('startDate').value
        var startUnix = new Date(startDate.split('T')[0]).getTime()
    
        var startTime = startDate.split('T')[1]
        startTime = startTime.split(':')
        startUnix += startTime[0] * 3600
        startUnix += startTime[1] * 60
    
        var data = {                                                  // data
            activities: [],
            location: document.getElementById('location').value,
            start: startUnix,
            end: endUnix
        }

        console.log(data)
    
        const activities = ['tennis', 'basketball', 'hiking', 'volleyball', 'swimming', 'badminton']
    
        for (let i = 0; i < activities.length; i++) {
            if (document.getElementById(activities[i]).checked) {
                data.activities.push(activities[i])
            }
        }

    
        var xhr = new XMLHttpRequest();                                 // create http request and send it
        xhr.open('POST', '/buddy', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    
        xhr.onreadystatechange = function () {                          // wait for response
            if (xhr.readyState == 4) {
                const response = xhr.responseText

                const data = JSON.parse(response)
                display(data)
            }
        };
    } catch {
        alert('Something isn\'t right!')
    }
}

function searchBuddyRequest () {
    try {
        const endDate = document.getElementById('endDate').value        // convert to unix dates
        var endUnix = new Date(endDate.split('T')[0]).getTime()
    
        var endTime = endDate.split('T')[1]
        endTime = endTime.split(':')
        endUnix += endTime[0] * 3600
        endUnix += endTime[1] * 60
    
        const startDate = document.getElementById('startDate').value
        var startUnix = new Date(startDate.split('T')[0]).getTime()
    
        var startTime = startDate.split('T')[1]
        startTime = startTime.split(':')
        startUnix += startTime[0] * 3600
        startUnix += startTime[1] * 60
    
        var data = {                                                  // data
            activities: [],
            location: document.getElementById('location').value,
            start: startUnix,
            end: endUnix
        }
    
        const activities = ['tennis', 'basketball', 'hiking', 'volleyball', 'swimming', 'badminton']
    
        for (let i = 0; i < activities.length; i++) {
            if (document.getElementById(activities[i]).checked) {
                data.activities.push(activities[i])
            }
        }

    
        var xhr = new XMLHttpRequest();                                 // create http request and send it
        xhr.open('POST', '/findbuddy', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.send(JSON.stringify(data));
    
        xhr.onreadystatechange = function () {                          // wait for response
            if (xhr.readyState == 4) {
                const response = xhr.responseText

                const data = JSON.parse(response)
                display(data)
            }
        };
    } catch {
        alert('Something isn\'t right!')
    }
}

function display(data) {
    const container = document.getElementById('container')

    removeAllChildNodes(container)
    console.log(data)
    container.appendChild(data)
}

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}