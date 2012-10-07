"use strict";

/* $(document)
    .ajaxStart(blockUI)
    .ajaxStop(unblockUI); */

function blockUI() {
    $.blockUI({
        message: '<h1 style="height:40px;weight:40px;">Загрузка...</h1>'
    });
}

window.onerror = function (error, file, line) {

};

var tx_map = {};

tx_map.config = {
    osm_script: "http://dev.openlayers.org/releases/OpenLayers-2.11/OpenLayers.js",
    // osm_tiles: "http://otile3.mqcdn.com/tiles/1.0.0/osm/${z}/${x}/${y}.jpg",
    osm_tiles: "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png",

    // osm_script: "http://192.168.1.49/OL212/OpenLayers.js",
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
            loadScript("js/osm_heatmap.js");
            loadScript("js/utils.js");

            initMap();
            tx_map.init_done = true;
        });
});

function initMap() {
    var lon = tx_map.config.default_location.lon;
    var lat = tx_map.config.default_location.lat;
    var zoom = tx_map.config.default_zoom;

    var container_id = "map";

    window.map = new OpenLayers.Map(container_id, {
        numZoomLevels: 20,
        units: 'm',
        projection : new OpenLayers.Projection("EPSG:900913"),
        displayProjection : new OpenLayers.Projection("EPSG:4326"),
        controls : [
            new OpenLayers.Control.Navigation(),
            new OpenLayers.Control.PanZoomBar(),
            new OpenLayers.Control.ScaleLine({ geodesic: true }),
            new OpenLayers.Control.LayerSwitcher({mode:'radio'}),
            new OpenLayers.Control.MousePosition({
                displayProjection : new OpenLayers.Projection("EPSG:4326")
            }),
            new OpenLayers.Control.OverviewMap(),
            new OpenLayers.Control.KeyboardDefaults(),
            new OpenLayers.Control.Navigation({
                dragPanOptions: { enableKinetic: true }
            })
        ]
    });

    window.tooltipPopup = null;

    var mapnik = new OpenLayers.Layer.OSM("Карта",
        tx_map.config.osm_tiles, {
            numZoomLevels : 20,
            layers: 'basic',
            transitionEffect: 'resize'
        });

    map.addLayer(mapnik);
    map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
            "EPSG:900913")), zoom);

    /**
     * Repaints the map with new values.
     */
    var repaint = function(event){
        this.features.forEach(function(feature) {
            feature.style = {
                fill: true,
                fillColor: "red",//'#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6)
                fillOpacity : 0.7
            };
        });
        this.redraw();
    };

    window.mapRegions = new OpenLayers.Layer.Vector("Регионы", {
        protocol: new OpenLayers.Protocol.HTTP({
            url: "regions.json",
            format: new OpenLayers.Format.GeoJSON()
        }),
        strategies: [new OpenLayers.Strategy.Fixed()],
        isBaseLayer:false,
        renderers:["SVG", "VML", "Canvas"],
        projection:new OpenLayers.Projection("EPSG:4326"),
        eventListeners: {
            "featuresadded": repaint
        }
    });

    map.addLayer(mapRegions);

    // create select for tooltips (OpenLayers Feature Tooltip)
    var highlightCtrl = new OpenLayers.Control.SelectFeature(mapRegions, {
        hover: true,
        highlightOnly: true,
        renderIntent: "temporary",
        eventListeners: {
            featurehighlighted: tooltipSelect,
            featureunhighlighted: tooltipUnselect
        }
    });
    map.addControl(highlightCtrl);
    highlightCtrl.activate();

    var selectCtrl = new OpenLayers.Control.SelectFeature(mapRegions,
        {
            clickout: true, toggle: false,
            multiple: false,
            toggleKey: "ctrlKey", // ctrl key removes from selection
            multipleKey: "shiftKey" // shift key adds to selection
        }
    );
    map.addControl(selectCtrl);
    selectCtrl.activate();

    mapRegions.events.on({
        featureselected: function(e) {

            // Mark and save
            e.feature.data.oldFillColor = e.feature.style.fillColor;
            e.feature.style.fillColor = "blue";
            e.feature.attributes.selected = true;

            e.feature.layer.drawFeature(e.feature);
        },
        featureunselected: function(e) {
            e.feature.style.fillColor = e.feature.data.oldFillColor;

            e.feature.layer.drawFeature(e.feature);
        }
    });

}

function tooltipSelect(e) {

    var olds_feature = mapRegions.getFeaturesByAttribute("highlighted", true);

    // Unmark and restore old
    olds_feature.forEach(function(of) {
        of.style.strokeColor = of.data.oldColor;
        of.style.strokeWidth = of.data.oldWidth;
        of.attributes.highlighted = false;

        of.layer.drawFeature(of);
    });

    // Mark and save
    e.feature.data.oldColor = e.feature.style.strokeColor;
    e.feature.data.oldWidth = e.feature.style.strokeWidth;
    e.feature.style.strokeColor = "white";
    e.feature.style.strokeWidth = 3;
    e.feature.attributes.highlighted = true;



    if (typeof e.feature.tooltip != 'undefined' && e.feature.tooltip != null) {
        return;
    }
    // remove tooltip if exists
    if (tooltipPopup != null) {
        map.removePopup(tooltipPopup);
        tooltipPopup.destroy();
        tooltipPopup = null;
    }
    var htmlContent = '<span style="font-weight:bold">' + e.feature.attributes.name + '</span><hr/>';
    var center = e.feature.geometry.getBounds().getCenterLonLat();
    tooltipPopup = new OpenLayers.Popup("activetooltip",
        center,
        new OpenLayers.Size(240, 25),
        htmlContent,
        false);
    tooltipPopup.closeOnMove = true;
    tooltipPopup.autoSize = true;
    // set tooltip style
    tooltipPopup.backgroundColor = '#000';
    tooltipPopup.opacity = 0.85;
    // jQuery wrapper
    $(tooltipPopup.div).css({
        'border-width': '1px',
        'border-color': '#000',
        'border-radius': '4px',
        'border-style': 'solid',
        'padding': '1px',
        'margin-left': '10px',
        'margin-top': '4px'
    });
    // jQuery wrapper
    $(tooltipPopup.contentDiv).css({
        'overflow': 'hidden',
        'padding': '8px',
        'color': '#fff'
    });
    e.feature.tooltip = tooltipPopup;
    map.addPopup(e.feature.tooltip);

    e.feature.layer.drawFeature(e.feature);
}
function tooltipUnselect(e) {

    e.feature.style.strokeColor = e.feature.data.oldColor;
    e.feature.style.strokeWidth = e.feature.data.oldWidth;

    if (typeof e.feature.tooltip !== 'undefined' && e.feature.tooltip != null) {
        map.removePopup(e.feature.tooltip);
        // fix: map property

        e.feature.tooltip = null;
        tooltipPopup = null;
    }
    e.feature.layer.drawFeature(e.feature);
}

function putOnMap(opts) {
    var loc = opts.loc;
    var data = opts.data;
    var marker_url = opts.marker_url || tx_map.config.found_tx_marker;
    var cb = opts.cb;
    var layer = opts.layer;

    var size = new OpenLayers.Size(8, 8);
    var offset = new OpenLayers.Pixel(-(size.w / 2), -size.h);
    var icon = new OpenLayers.Icon(marker_url, size, offset);

    var lonLat = new OpenLayers.LonLat(loc.lon, loc.lat).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject());

    var marker = new OpenLayers.Marker(lonLat, icon);

    marker.events.register('mousedown', {
        data: data
    }, function() {
        if (typeof cb == "function")
            cb(this.data);
    });

    layer.addMarker(marker);
}

function showPopup(loc, content) {
    // XXX: fix popup style
    var popup = new OpenLayers.Popup("Инфо",
        new OpenLayers.LonLat(loc.lon, loc.lat).transform(
            map.displayProjection,
            map.projection),
        new OpenLayers.Size(200, 200),
        content,
        true);

    map.popups.forEach(function(p) { map.removePopup(p); });
    map.addPopup(popup);
}
