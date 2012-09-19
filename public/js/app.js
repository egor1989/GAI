"use strict";

/* $(document)
    .ajaxStart(blockUI)
    .ajaxStop(unblockUI); */

function blockUI() {
    $.blockUI({
        message: '<h1 style="height:40px;weight:40px;">Загрузка...</h1>',
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#fff',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .7,
            color: '#000'
        }
    });
}

function unblockUI() {
    $.unblockUI();
}

window.onerror = function (error, file, line) {
    $.unblockUI();
};

var tx_map = {};

tx_map.config = {
    osm_script: "http://dev.openlayers.org/releases/OpenLayers-2.11/OpenLayers.js",
    // osm_tiles: "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg",
    osm_tiles: "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png",

    // osm_script: "http://192.168.1.49/OL211/OpenLayers.js",
    // osm_tiles: "http://192.168.1.49/MTiles/${z}/${x}/${y}.png",

    osm_nominatim: "http://nominatim.openstreetmap.org/search",
    default_location: {
        lat: 45.927,
        lon: 55.316
    },
    default_zoom: 4,
    found_tx_marker: "img/green8x8.png",
    notfound_tx_marker: "img/red8x8.png"
};

// XXX: getScript(), but we load sync
function loadScript(url) {
    $.ajax({
        url : url,
        dataType : "script",
        async : false,
        cache: false
    });
};

$(function() {
    $.getScript(tx_map.config.osm_script)
        .success(function() {
            loadScript("js/map.js");
            loadScript("js/osm_heatmap.js");
            loadScript("js/utils.js");

            tx_map.init_done = true;

            $("body").trigger("weinit");
        });
});
