$(function () {
    require([
        "js/timeline.js",
        "js/charts.js",
        "js/data.js",
        "js/map.js",
        "js/osm_heatmap.js",
        "js/utils.js"
    ], function () {

        var charts = [],
            titles = ["Общее количество ДТП", "Кол-во ДТП на 10тыс. ед. ТС", "Общее число погибших и раненных", "Число пострадавших на 100 тыс. жителей"],
            datasets = {
                2012:{
                    chart0:[
                        {
                            type:'pie',
                            data:[1, 0, 4]
                        }
                    ],
                    chart1:[
                        {
                            type:'pie',
                            data:[2, 4, 3]
                        }
                    ],
                    chart2:[
                        {
                            type:'pie',
                            data:[3, 2, 8]
                        }
                    ],
                    chart3:[
                        {
                            type:'pie',
                            data:[8, 5, 6]
                        }
                    ]
                },
                2011:{
                    chart0:[
                        {
                            type:'pie',
                            data:[5, 2, 3]
                        }
                    ],
                    chart1:[
                        {
                            type:'pie',
                            data:[3, 2, 1]
                        }
                    ],
                    chart2:[
                        {
                            type:'pie',
                            data:[1, 4, 5]
                        }
                    ],
                    chart3:[
                        {
                            type:'pie',
                            data:[2, 3, 1]
                        }
                    ]
                },
                2010:{
                    chart0:[
                        {
                            type:'pie',
                            data:[1, 9, 1]
                        }
                    ],
                    chart1:[
                        {
                            type:'pie',
                            data:[2, 1, 3]
                        }
                    ],
                    chart2:[
                        {
                            type:'pie',
                            data:[3, 1, 8]
                        }
                    ],
                    chart3:[
                        {
                            type:'pie',
                            data:[8, 2, 6]
                        }
                    ]
                }
            };

        initMap();
        tx_map.init_done = true;
        //timeLine.activate(2013);
        $('#switchView').tabs().removeClass('ui-widget ui-widget-content ui-corner-all');
        // приводим вкладки к нужному виду
        $(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *")
            .removeClass("ui-corner-all ui-corner-top")
            .addClass("ui-corner-bottom");
        $(".ui-tabs-nav").removeClass("ui-widget-header ui-corner-bottom");
        $(".ui-state-default").addClass('ui-corner-all');

        Highcharts.getOptions().colors = $.map(Highcharts.getOptions().colors, function (color) {
            return {
                radialGradient:{ cx:0.5, cy:0.3, r:0.7 },
                stops:[
                    [0, color],
                    [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
                ]
            };
        });

        for (var i = 0; i < 4; i++)
            charts.push(createChart('testChart' + i, titles[i], datasets["2010"]['chart' + i]));

        datasets['2012'] = getChartDataFromJSON(reportdata);

        var onTimeLineChange = function (event, data) {
                for (var i = 0; i < 4; i++) {
                    $.each(charts[i].series, function (j, val) {

                        if (data == '2012') {
                            val.setData(datasets[data]['chart' + i], false);
                        } else
                            val.setData(datasets[data]['chart' + i][j].data, false);
                    });
                    charts[i].redraw(true);
                }
                console.log(data);
            },
            timeLine = new TimeLine("#timeline", "#dates", "#issues", onTimeLineChange);

        for (var i = 2010; i < 2013; i++) {
            timeLine.addDate(i);
        }
        //timeLine.addDate('2010');
        timeLine.update();
        timeLine.activate('2012');

        window.charts = charts;

        $('#chartsList').on('chartSelected', function (event, data) {
            if (data.$container.hasClass('selected')) {
                data.$container.removeClass('selected');
                data.$container.parent().siblings().children().removeClass('notselected');
                $.each(charts, function (i, val) {
                    val.setSize(400, 250);
                });
            }
            else {
                var parent = data.$container.parent();
                parent.prependTo(parent.parent());
                parent.siblings().children().removeClass('selected').addClass('notselected');
                data.$container.removeClass('notselected').addClass('selected');
                data.chart.setSize(800, 400);
                $.each(charts, function (i, val) {
                    if (val != data.chart) {
                        val.setSize(260, 80);
                    }
                });
            }
        });
    })
});

function getChartDataFromJSON(json) {
    var rtcTotal = [],
        rtcTotalCount = 0,
        rtcBy10k = [],
        rtcBy10kCount = 0,
        injury = [],
        injuryCount = 0,
        vehicle = [],
        vehicleCount = 0;
    $.each(json.data, function (i, val) {
        if (val.region != "Российская Федерация") {
            rtcTotalCount += parseInt(val.rtc_total);
            rtcBy10kCount += parseInt(val.rtc_by10kk_abs);
            injuryCount += parseInt(val.injury_total);
            vehicleCount += parseInt(val.vehicle_total);

            rtcTotal.push([val.region, parseInt(val.rtc_total)]);
            rtcBy10k.push([val.region, parseInt(val.rtc_by10kk_abs)]);
            injury.push([val.region, parseInt(val.injury_total)]);
            vehicle.push([val.region, parseInt(val.vehicle_total)]);
        }
        /*else {
         rtcTotalCount = parseInt(val.rtc_total);
         rtcBy10kCount = parseInt(val.rtc_by10kk_abs);
         injuryCount = parseInt(val.injury_total);
         injuryBy100kCount = parseInt(val.injury_by100kk_abs);
         }*/
    });
    return {
        chart0:addThreshHold(rtcTotal, 2, rtcTotalCount),
        chart1:addThreshHold(rtcBy10k, 2, rtcBy10kCount),
        chart2:addThreshHold(injury, 2, injuryCount),
        chart3:addThreshHold(vehicle, 2, vehicleCount)
    }
}

function addThreshHold(data, percent, total) {
    var newData = [],
        others = ['Другие', 0];
    $.each(data, function (i, val) {
        if (val[1] * 100 / total < percent) {
            others[1] += val[1];
        }
        else
            newData.push(val);
    });
    newData.push(others);
    return _.sortBy(newData, function (obj) {
        return obj[1]
    });
}
