function createChart(chart, title, series) {
    $('#' + chart).addClass('chart');

    return new Highcharts.Chart({
        chart:{
            renderTo:chart,
            type:'pie',
            events:{
                click:function (event, data) {
                    var $container = $(this.container).parent();
                    $container.parent().trigger('chartSelected', {chart:this, $container:$container });
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


function createStackedChart(chart) {
    $('#' + chart).addClass('chart');
    return new Highcharts.Chart({

        chart:{
            renderTo:chart,
            type:'column',
            events:{
                click:function (event, data) {
                    var $container = $(this.container).parent();
                    $container.parent().trigger('chartSelected', {chart:this, $container:$container });
                }
            }
        },

        title:{
            text:'Распределение по типу аварий в Лен. области'
        },

        xAxis:{
            categories:["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"]
        },

        yAxis:{
            allowDecimals:false,
            min:0,
            title:{
                text:'Number of fruits'
            }
        },

        tooltip:{
            formatter:function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + '<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },

        plotOptions:{
            column:{
                stacking:'normal'
            }
        },

        series:[
            {
                name:'John',
                data:[5, 3, 4, 7, 2, 2, 2, 2, 2, 2],
                stack:'male'
            },
            {
                name:'Joe',
                data:[3, 4, 4, 2, 5, 2, 2, 2, 2, 2],
                stack:'male'
            },
            {
                name:'Jane',
                data:[2, 5, 6, 2, 1, 2, 2, 2, 2, 2],
                stack:'female'
            },
            {
                name:'Janet',
                data:[3, 0, 4, 4, 3, 2, 2, 2, 2, 2],
                stack:'female'
            }
        ]
    });
}

