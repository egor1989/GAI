function createChart(chart, title, series) {
    $('#' + chart).addClass('chart');

    return new Highcharts.Chart({
        chart:{
            renderTo:chart,
            type:'pie'
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
        series:[
            {
                type:'pie',
                data:series
            }
        ]
    });
}


function createStackedChart(chart) {
    $('#' + chart).addClass('chart');
    return new Highcharts.Chart({

        chart:{
            renderTo:chart,
            type:'column',
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


function createAlcoChart(chart) {
    $('#' + chart).addClass('chart');
    return new Highcharts.Chart({
        chart:{
            renderTo:chart,
            type:'line',
            marginRight:130,
            marginBottom:25
        },
        title:{
            text:'Число пострадавших и погибших в ДТП',
            x:-20 //center
        },
        subtitle:{
            text:'Открытые данные',
            x:-20
        },
        xAxis:{
            categories:['2004', '2005', '2006', '2007', '2008', '2009',
                '2010', '2011']
        },
        yAxis:{
            title:{
                text:'Человек'
            },
            plotLines:[
                {
                    value:0,
                    width:1,
                    color:'#808080'
                }
            ]
        },
        tooltip:{
            formatter:function () {
                return '<b>' + this.series.name + '</b><br/>' +
                    this.x + ': ' + this.y + '°C';
            }
        },
        legend:{
            layout:'vertical',
            align:'right',
            verticalAlign:'top',
            x:-10,
            y:150,
            borderWidth:0
        },
        series:[
            //{
            //  name: 'Нарушения (пострадавшие)',
            //  data: [164342, 180578, 187531, 195488, 183349, 173327, 169437, 170788]
            //},
            {
                name:'Погибло в ДТП',
                data:[27575, 27623, 26776, 27729, 24900, 23146, 22221, 23471]
            },
            //{
            //name: 'Нетрезвые (пострадавшие)',
            //data: [21569, 19567, 17017, 15593, 13611, 12327, 11845, 12252]
            //},
            {
                name:'Погибло в ТП по вине нетрезвых водителей',
                data:[3645, 3170, 2673, 2555, 2383, 2310, 1954, 2103]
            }
        ]
    });
}
