$(function(){
    require([
        "js/timeline.js",
        "js/charts.js"
    ], function() {
        var timeLine = new TimeLine("#timeline", "#dates", "#issues");
        timeLine.addDate('2013', {html:'123'});
        timeLine.update();
        timeLine.activate(2013);
        window.chart = createChart('testChart');
        window.chart = createChart('testChart1');
        window.chart = createChart('testChart2');
        window.chart = createChart('testChart3');
        $('#switchView').tabs().removeClass('ui-widget ui-widget-content ui-corner-all');
        $( ".tabs-bottom .ui-tabs-nav, .tabs-bottom .ui-tabs-nav > *" )
            .removeClass( "ui-corner-all ui-corner-top" )
            .addClass( "ui-corner-bottom" );
        $(".ui-tabs-nav").removeClass("ui-widget-header ui-corner-bottom");
        $(".ui-state-default").addClass('ui-corner-all')
    });
});