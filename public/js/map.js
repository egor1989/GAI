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

function showTxPopup(tx) {
    var $tx = $.template("<span>" +
                         "Date: ${date} <br />" +
                         "Currency: ${currency} <br />" +
                         "Description: ${desc} <br />" +
                         "Seller: ${seller} <br />" +
                         "City: ${city} <br />" +
                         "Country: ${country} <br />" +
                         "Opertaion: ${ops} <br />" +
                         "Bill: ${bill} <br />" +
                         "</span>");
    var loc = tx[name2idx["loc"]];

    showPopup(loc,
              $.tmpl($tx, {
                  date: tx[name2idx["date"]],
                  currency: tx[name2idx["currency"]],
                  desc: tx[name2idx["description"]],
                  seller: tx[name2idx["seller"]],
                  city: tx[name2idx["city"]],
                  country: tx[name2idx["country"]],
                  ops: tx[name2idx["operation"]],
                  bill: tx[name2idx["bill"]],
              })[0].outerHTML);
}

function showShipmentDetail(shipment, schema) {
    var $shipment = $.template("<span>" +
                               "Date: ${date} <br />" +
                               "Invoice: ${invoice} <br />" +
                               "From: ${from} <br /> " +
                               "To: ${to} <br />" +
                               "From st: ${from_station} <br />" +
                               "To st: ${to_station} <br />" +
                               "Product: ${product} <br />" +
                               "</span>");

    $("#selected_path").empty();

    $.tmpl($shipment, {
        date: shipment[schema.invoice_date],
        invoice: shipment[schema.invoice_num],
        from: shipment[schema.name_from],
        to: shipment[schema.name_to],
        from_station: shipment[schema.name_station_from],
        to_station: shipment[schema.name_station_to],
        product: shipment[schema.name_SNG]
    }).appendTo("#selected_path");

    //    showPopup(loc,);
}

function drawShipmentPath(opts) {
    var loc_from = opts.loc_from;
    var loc_to = opts.loc_to;
    var data = opts.data;
    var cb = opts.cb;
    var layer = opts.layer;

    heat.addSource(new Heatmap.Source(
        new OpenLayers.LonLat(loc_from.lon, loc_from.lat)
            .transform(
                new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"))
    ));

    heat.addSource(new Heatmap.Source(
        new OpenLayers.LonLat(loc_to.lon, loc_to.lat)
            .transform(
                new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection("EPSG:900913"))
    ));

    var lineString = new OpenLayers.Geometry.LineString(
        [
            new OpenLayers.Geometry.Point(loc_from.lon, loc_from.lat),
            new OpenLayers.Geometry.Point(loc_to.lon, loc_to.lat),
        ]).transform(
            new OpenLayers.Projection("EPSG:4326"),
            map.getProjectionObject());
    var lineFeature = new OpenLayers.Feature.Vector(lineString,
                                                    {
                                                        data: data,
                                                        cb: cb
                                                    },
                                                    {
                                                        color: opts.color || "red",
                                                        fillColor : opts.color || "red",
                                                        strokeColor: opts.color || "blue",
                                                        fillOpacity : 0.,
                                                        strokeOpacity: opts.opacity || 0.5,
                                                        strokeWidth: opts.width || "1"
                                                    });

    layer.addFeatures(lineFeature);
}