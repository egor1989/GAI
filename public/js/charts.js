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

// window.allConcreteData
function loadAllConcreteData() {

    if (typeof(window.allConcreteData) != "undefined" ) {
	return;
    }

    var allJSON = {
	"2010": [
	    "js/data/2010/a114_vologda.utf8.json",
	    "js/data/2010/m10_russia.utf8.json",
	    "js/data/2010/m10_skandinaviya.utf8.json",
	    "js/data/2010/m11_narva.utf8.json",
	    "js/data/2010/m18_pskov.utf8.json",
	    "js/data/2010/m20_pskov.utf8.json",
	    "js/data/2010/pargolovo_ogonki.utf8.json",
	    "js/data/2010/sortava.utf8.json",
	    "js/data/2010/ujnoe_polukolco.utf8.json"
	],
	"2011": [
	    "js/data/2011/0010.utf8.json",
	    "js/data/2011/0011.utf8.json",
	    "js/data/2011/0018.utf8.json",
	    "js/data/2011/0020.utf8.json",
	    "js/data/2011/0114.utf8.json",
	    "js/data/2011/1407.utf8.json",
	    "js/data/2011/1500.utf8.json",
	    "js/data/2011/1510_KAD.utf8.json",
	    "js/data/2011/pargolovo_ogonki.utf8.json"
	]
    };

    var allConcreteData = {
	"2011": [],
	"2010": []
    };

    ["2010", "2011"].forEach(function(year) {
	allJSON[year].forEach(function(jsonFile) {
	    $.ajax({
		url: jsonFile,
		async: false,
		success: function(data) {
		    allConcreteData[year].push(data.events);
		},
		error: function(omg) { console.error("DIE"); }
	    });
	});
    });

    window.allConcreteData = allConcreteData;
}

function createStackedChart(chart) {
    $('#' + chart).addClass('chart');

    loadAllConcreteData();

    var chartsData = [];

    ["2010", "2011"].forEach(function(year) {
	var uniqueCause = _(allConcreteData[year]).chain().flatten(true).map(function(d) { return d[4]; }).unique().value();

	uniqueCause.forEach(function(cause) {
	    var rtcCause = _(allConcreteData[year]).chain().flatten(true).filter(function(d) { return d[4] == cause; }).value();

	    var dataByMonth = [];

	    _.range(12).forEach(function(i) {
		dataByMonth[i] = 0;
	    });

	    rtcCause.forEach(function(oneRtc) {
		var month = +oneRtc[2].split(".")[1];

		if (typeof(dataByMonth[month - 1]) == "undefined") {
		    dataByMonth[month - 1] = 1;
		} else {
		    dataByMonth[month - 1]++;
		}
	    });

	    if (cause == "")
		cause = "Другое";

	    chartsData.push({
		name: cause,
		data: dataByMonth,
		stack: year
	    });
	});
    });

    window.chartsData = chartsData;

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
                text:'Количество ДТП'
            }
        },

        tooltip:{
            formatter:function () {
                return '<b>' + this.x + '</b><br/>' +
                    this.series.name + ': ' + this.y + ' (' + this.series.stackKey.replace("column", '') + ')<br/>' +
                    'Total: ' + this.point.stackTotal;
            }
        },

        plotOptions:{
            column:{
                stacking:'normal'
            }
        },

        series: chartsData
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
                name:'Погибло по вине нетрезвых водителей',
                data:[3645, 3170, 2673, 2555, 2383, 2310, 1954, 2103]
            }
        ]
    });
}
