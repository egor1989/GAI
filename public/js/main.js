$(function () {
    require([
        "js/timeline.js",
        "js/charts.js",
        "js/data.js",
        "js/i18n.ru.js",
        "js/config.js",
        "js/map.js",
        "js/geo/country.js",
        "js/geo/federal_.js",
        "js/geo/regions.js",
        "js/osm_heatmap.js",
        "js/utils.js"
    ], function () {

        var charts = [],
            dynamics = [],
            titles = ["Общее количество ДТП", "Кол-во ДТП на 10тыс. ед. ТС", "Общее число погибших и раненных", "Число пострадавших на 100 тыс. жителей"],
            datasets = {},
            colors = {};

        $.each(reportdata['2012'].data, function(i, val) {
            colors[val.region] = '#'+Math.floor(Math.random()*16777215).toString(16);
        });
        colors["Другие"] = '#'+Math.floor(Math.random()*16777215).toString(16);


        initMap();
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



        dynamics.push(createStackedChart('dynamicsChart0'));
        dynamics.push(createAlcoChart('dynamicsChart1'));
        /*$.each(window.reportdata, function(i, val) {
            datasets[i] = getChartDataFromJSON(val);
        });*/
        var onTimeLineChange = function (event, data) {
            console.log(data);
            /*
             * Charts update
             */
            for (var i = 0; i < 4; i++) {
                $.each(charts[i].series, function (j, val) {
                    val.setData(datasets[data]['chart' + i], false);
                });
                charts[i].redraw(true);
            }

            /*
             * Map update
             */
            Map.fillStatistic(window.reportdata[data], window.RussiaStat[data]);

        };
        var timeLine = new TimeLine("#timeline", "#dates", "#issues", onTimeLineChange);

                //timeLine.addDate('2010');

        window.RussiaStat = [];
        for (var i = 2004; i < 2013; i++) {
            datasets[i + ''] = getChartDataFromJSON(window.reportdata[i + ''], colors);
            getRussiaStatFromJSON(window.reportdata[i + ''], i);
            timeLine.addDate(i);
        }

        console.log(window.RussiaStat);

        for (var i = 0; i < 4; i++)
            charts.push(createChart('testChart' + i, titles[i], datasets["2012"]['chart' + i]));

        timeLine.update();
        timeLine.activate('2012');


        window.charts = charts;
        // привязываем данные к листам
        $('#chartsList').data('charts', charts);
        $('#dynamicsList').data('charts', dynamics);
        $.each(charts, function(i, val) {
            $('#chartsList').children(':nth-child(' + (i + 1) +')').children().data('chart', val);
            $('#dynamicsList').children(':nth-child(' + (i + 1) +')').children().data('chart', dynamics[i]);
        });

        $('.chartsList').children().children().children().on('click', function () {
            console.log('clicked');
            var parent = $(this).parent().parent(),
                currCharts = parent.parent().data('charts'),
                $container = $(this).parent(),
                chart = $container.data('chart');
            if ($container.hasClass('selected')) {
                $container.removeClass('selected');
                parent.siblings().children().removeClass('notselected');
                $.each(currCharts, function (i, val) {
                    val.setSize(400, 250);
                });
            }
            else {
                parent.prependTo(parent.parent());
                parent.siblings().children().removeClass('selected').addClass('notselected');
                $container.removeClass('notselected').addClass('selected');
                chart.setSize(800, 400);
                $.each(currCharts, function (i, val) {
                    if (val != chart) {
                        val.setSize(260, 100);
                    }
                });
            }
        });
    })
});

function getRussiaStatFromJSON(json, index) {
    json.data.forEach(function (item) {
        if (item.region == "Российская Федерация") {
            window.RussiaStat[index + ''] = {
                rtcTotal:parseInt(item.rtc_total),
                rtcBy10k:parseInt(item.rtc_by10kk_abs),
                injury:parseInt(item.injury_total),
                vehicle:parseInt(item.vehicle_total)
            };
        }
    });

}

function getChartDataFromJSON(json, colors) {
    var rtcTotal = [],
        rtcTotalCount = 0,
        rtcBy10k = [],
        rtcBy10kCount = 0,
        injury = [],
        injuryCount = 0,
        vehicle = [],
        vehicleCount = 0;
    $.each(json.data, function (i, val) {
        if (val.region != "Российская Федерация" && val.region.indexOf("округ") == -1
            && val.region.indexOf(" и ") == -1) {
            rtcTotalCount += parseInt(val.rtc_total);
            rtcBy10kCount += parseInt(val.rtc_by10kk_abs);
            injuryCount += parseInt(val.injury_total);
            vehicleCount += parseInt(val.vehicle_total);

            rtcTotal.push({color:colors[val.region], name:val.region, y:parseInt(val.rtc_total)});
            rtcBy10k.push({color:colors[val.region], name:val.region, y:parseInt(val.rtc_by10kk_abs)});
            injury.push({color:colors[val.region], name:val.region, y:parseInt(val.injury_total)});
            vehicle.push({color:colors[val.region], name:val.region, y:parseInt(val.vehicle_total)});
        }
        /*else {
         rtcTotalCount = parseInt(val.rtc_total);
         rtcBy10kCount = parseInt(val.rtc_by10kk_abs);
         injuryCount = parseInt(val.injury_total);
         injuryBy100kCount = parseInt(val.injury_by100kk_abs);
         }*/
    });
    return {
        chart0:addThreshHold(rtcTotal, 2, rtcTotalCount, colors),
        chart1:addThreshHold(rtcBy10k, 1.2, rtcBy10kCount, colors),
        chart2:addThreshHold(injury, 2, injuryCount, colors),
        chart3:addThreshHold(vehicle, 2, vehicleCount, colors)
    }
}

function addThreshHold(data, percent, total, colors) {
    var newData = [],
        others = {name:'Другие', y:0, color:colors['Другие']};
    $.each(data, function (i, val) {
        if (val.y * 100 / total < percent) {
            others.y += val.y;
        }
        else
            newData.push(val);
    });
    newData.push(others);
    return _.sortBy(newData, function (obj) {
        return obj.data
    });
}
