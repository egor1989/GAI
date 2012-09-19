$(function() {
    var lon = tx_map.config.default_location.lon;
    var lat = tx_map.config.default_location.lat;
    var zoom = tx_map.config.default_zoom;

    var container_id = "map";

    window.map = new OpenLayers.Map(container_id, {
        projection : new OpenLayers.Projection("EPSG:900913"),
        displayProjection : new OpenLayers.Projection("EPSG:4326"),

        controls : [ new OpenLayers.Control.Navigation(),
                     new OpenLayers.Control.PanZoomBar(),
                     new OpenLayers.Control.ScaleLine(),
                     new OpenLayers.Control.LayerSwitcher(),
                     new OpenLayers.Control.MousePosition({
                         displayProjection : new OpenLayers.Projection("EPSG:4326")
                     }),
                     new OpenLayers.Control.OverviewMap(),
                     new OpenLayers.Control.KeyboardDefaults()
                   ]
    });

    var mapnik = new OpenLayers.Layer.OSM("Main",
                                          tx_map.config.osm_tiles, {
                                              numZoomLevels : 19,
                                              layers: 'basic'
                                          });

    map.addLayer(mapnik);
    map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
        new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
            "EPSG:900913")), zoom);
});

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
