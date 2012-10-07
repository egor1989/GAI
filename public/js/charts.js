function createChart(chart, series) {
    $('#' + chart).addClass('chart');
    return new Highcharts.Chart({
        chart: {
            renderTo: chart,
            type: 'line'
        },
        title: {
            text: 'Fruit Consumption'
        },
        xAxis: {
            categories: ['Apples', 'Bananas', 'Oranges']
        },
        yAxis: {
            title: {
                text: 'Fruit eaten'
            }
        },
        series: series
    });
}

