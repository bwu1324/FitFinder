google.charts.load("current", {packages: ["corechart"]});
google.charts.setOnLoadCallback(drawChart);

function drawChart() {
    var data1 = google.visualization.arrayToDataTable([
        ['Date', 'Minutes of Exercise',],
        ['4/12', 60],
        ['4/13', 69],
        ['4/14', 72],
        ['4/15', 120],
        ['4/16', 55],
        ['4/17', 10],
        ['4/18', 125],
        // Keep this to be past week, sum up all activities of a day
    ]);

    var data2 = google.visualization.arrayToDataTable([
        ['Task', 'Minutes in Past Week',],
        ['Curl-Ups', 129],
        ['Push-Ups', 120],
        ['Biking', 127],
        ['Running', 135],
        // Since these activities are past week, the minutes in data1 and data2 should add up to the same number
    ]);

    var options1 = {
        title: 'Your Daily Activity, in minutes',
        legend: {position: 'none'},
    };

    var options2 = {
        title: 'Your Exercises in the last 7 days, in minutes'
    };

    var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
    var chart2 = new google.visualization.PieChart(document.getElementById('chart_div2'));
    chart.draw(data1, options1);
    chart2.draw(data2, options2);
}