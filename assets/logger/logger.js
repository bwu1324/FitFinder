google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    const data = {
        type: "loggerdata"
    }
    var xhr = new XMLHttpRequest();                                 // create http request and send it
    xhr.open("POST", "/loggerdata", true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(data));

    xhr.onreadystatechange = function () {                          // wait for response
        if (xhr.readyState == 4) {
            const response = JSON.parse(xhr.responseText)

            var histogram = []
            for (let i = 0; i < response.data.length; i++) {
                var found = false
                for (let j = 0; j < histogram.length; j++) {
                    if (histogram[j][0] === response.data[i].date) {
                        histogram[j][1] = histogram[j][1] + response.data[i].mins
                        found = true
                    }
                }
                if (!found) {
                    histogram.push([response.data[i].date, response.data[i].mins])
                }
            }
            histogram.unshift(['Date', 'Minutes of Exercise',])

            var pi = []
            for (let i = 0; i < response.data.length; i++) {
                var found = false
                for (let j = 0; j < pi.length; j++) {
                    if (pi[j][0] === response.data[i].activityName) {
                        pi[j][1] = pi[j][1] + response.data[i].mins
                        found = true
                    }
                }
                if (!found) {
                    pi.push([response.data[i].activityName, response.data[i].mins])
                }
            }
            pi.unshift(['Task', 'Minutes of Exercise',])

            var data1 = google.visualization.arrayToDataTable(histogram)
            var data2 = google.visualization.arrayToDataTable(pi)

            var options1 = {
                title: 'Your Daily Activity, in minutes',
                legend: { position: 'none' },
            };
        
            var options2 = {
                title: 'Your Exercises in the last 7 days, in minutes'
            };
        
            var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
            var chart2 = new google.visualization.PieChart(document.getElementById('chart_div2'));
            chart.draw(data1, options1);
            chart2.draw(data2, options2);
        }
    };
}