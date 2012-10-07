$(function () {
    require([
        "js/timeline.js",
        "js/charts.js",
        "js/map.js"
    ], function () {
        var charts = [],
            datasets = {
                2012:{
                    chart0:[
                        {
                            name:'Jane',
                            data:[1, 0, 4]
                        },
                        {
                            name:'John',
                            data:[5, 7, 3]
                        }
                    ],
                    chart1:[
                        {
                            name:'Jane',
                            data:[2, 4, 3]
                        },
                        {
                            name:'John',
                            data:[8, 2, 2]
                        }
                    ],
                    chart2:[
                        {
                            name:'Jane',
                            data:[3, 2, 8]
                        },
                        {
                            name:'John',
                            data:[1, 0, 9]
                        }
                    ],
                    chart3:[
                        {
                            name:'Jane',
                            data:[8, 5, 6]
                        },
                        {
                            name:'John',
                            data:[9, 1, 4]
                        }
                    ]
                },
                2011:{
                    chart0:[
                        {
                            name:'Jane',
                            data:[5, 2, 3]
                        },
                        {
                            name:'John',
                            data:[8, 6, 4]
                        }
                    ],
                    chart1:[
                        {
                            name:'Jane',
                            data:[3, 2, 1]
                        },
                        {
                            name:'John',
                            data:[4, 4, 3]
                        }
                    ],
                    chart2:[
                        {
                            name:'Jane',
                            data:[1, 4, 5]
                        },
                        {
                            name:'John',
                            data:[8, 1, 6]
                        }
                    ],
                    chart3:[
                        {
                            name:'Jane',
                            data:[2, 3, 1]
                        },
                        {
                            name:'John',
                            data:[4, 5, 6]
                        }
                    ]
                },
                2010:{
                    chart0:[
                        {
                            name:'Jane',
                            data:[1, 9, 1]
                        },
                        {
                            name:'John',
                            data:[5, 4, 3]
                        }
                    ],
                    chart1:[
                        {
                            name:'Jane',
                            data:[2, 1, 3]
                        },
                        {
                            name:'John',
                            data:[8, 9, 2]
                        }
                    ],
                    chart2:[
                        {
                            name:'Jane',
                            data:[3, 1, 8]
                        },
                        {
                            name:'John',
                            data:[1, 3, 9]
                        }
                    ],
                    chart3:[
                        {
                            name:'Jane',
                            data:[8, 2, 6]
                        },
                        {
                            name:'John',
                            data:[9, 7, 4]
                        }
                    ]
                }
            };


        //timeLine.activate(2013);
        $('#switchView').tabs().removeClass('ui-widget ui-widget-content ui-corner-all');
        // приводим вкладки к нужному виду
        $(".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *")
            .removeClass("ui-corner-all ui-corner-top")
            .addClass("ui-corner-bottom");
        $(".ui-tabs-nav").removeClass("ui-widget-header ui-corner-bottom");
        $(".ui-state-default").addClass('ui-corner-all');


        for (var i = 0; i < 4; i++)
            charts.push(createChart('testChart' + i, datasets["2012"]['chart' + i]));

        var onTimeLineChange = function (event, data) {
                for (var i = 0; i < 4; i++) {
                    $.each(charts[i].series, function (j, val) {
                        val.setData(datasets[data]['chart'+i][j].data, false);
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

        window.charts = charts;

        $('#switchView').tabs( 'select', 1 );

        $.getScript(tx_map.config.osm_script)
            .success(function() {
                loadScript("js/osm_heatmap.js");
                loadScript("js/utils.js");

                initMap();
                tx_map.init_done = true;
            });
    });
});

// XXX: getScript(), but we load sync
function loadScript(url) {
    $.ajax({
        url : url,
        dataType : "script",
        async : false,
        cache: false
    });
}


