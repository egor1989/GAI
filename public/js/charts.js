function createChart(chart, title, series) {
    $('#' + chart).addClass('chart');

    return new Highcharts.Chart({
        chart:{
            renderTo:chart,
            type:'pie',
            events:{
                click:function (event, data) {
                    var $container = $(this.container).parent();
                    $container.parent().trigger('chartSelected', {chart:this, $container: $container });
                }
            }
        },
        title:{
            text:title
        },
        plotOptions:{
            pie:{

                cursor:'pointer',
                dataLabels:{
                    enabled:true,
                    color:'#000000',
                    connectorColor:'#000000',
                    formatter:function () {
                        return '<b>' + this.point.name + '</b>: ' + Math.floor(this.percentage) + ' %';
                    }
                }
            }
        },
        tooltip:{
            pointFormat:'<b>{point.y}</b> ({point.percentage}%)',
            percentageDecimals:1
        },
        series:series
    });
}

