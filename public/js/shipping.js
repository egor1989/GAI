"use strict";

$(function() {
    if (tx_map.init_done == true) {
        mainApp();
    } else {
        $("body").bind("weinit", function() {
            mainApp();
        });
    }
});

// map function?
function rigisterClickHandlerOnPath(layer) {
    layer.events.on({
        featureselected: function(e) {
            console.log("feauter click", e);

            var data = e.feature.data.data;
            var cb = e.feature.data.cb;

            cb(null, data);
        },
        featureunselected: function(e) {
        },
        scope: { }
    });
}

function preInit() {
    initHeatMap();

    window.heat = new Heatmap.Layer("Градиентная карта", { visibility: false });
    map.addLayer(heat);

    // TODO: use vector layer too for intensity (line, circle, polygon)
    window.shipment_layer = new OpenLayers.Layer.Vector("Shipment", {
        renderers : OpenLayers.Layer.Vector.prototype.renderers,
    });
    map.addLayer(shipment_layer);

    var click = new OpenLayers.Control.SelectFeature(
        [shipment_layer],
        {
            clickout: true, toggle: false,
            multiple: false, hover: false,
            toggleKey: "ctrlKey", // ctrl key removes from selection
            multipleKey: "shiftKey" // shift key adds to selection
        });
    map.addControl(click);
    click.activate();

    rigisterClickHandlerOnPath(shipment_layer);

    // XXX: additional pre req
    fixFullHeight("map");
    fixFullHeight("paths");
}

function mainApp() {
    preInit();

    if (typeof currentCountry == "undefined" || currentCountry == null)
        return console.log(new Error("Country not defined"));

    $("#paths>li").live("click", function() {
        var shipment = $(this).data();

        onPathClick(shipment);

        // selecting path too!
        // TODO: selecting path, if selected from list!
        // by arrow? or color?
    });

    $.getJSON("/v1/shipping/country/period", { country: currentCountry }, function(period) {
        $("#period>#from").text(dateFormat(new Date(period.min), "dd.mm.yyyy HH:MM"));
        $("#period>#to").text(dateFormat(new Date(period.max), "dd.mm.yyyy HH:MM"));
    });

    blockUI();
    $.getJSON("/v1/shipping/paths", { country: currentCountry }, function(shipments) {
        shipments = _(shipments).sortBy(function(shipment) { return -shipment.count; });

        var total = _(shipments).reduce(function(memo, shipment) { return memo + shipment.count; }, 0);
        var max = _(shipments).max(function(shipment) { return shipment.count; }).count;

        $("#status>#total").text(total);

        shipments.forEach(function(shipment) {

            // to left list
            shipment.perc = (shipment.count/total*100).toFixed(1);
            $('#path-template').tmpl(shipment).appendTo("#paths").data(shipment);

            $("#paths>li").hover(
                function() { $(this).css("background-color", "#DDD"); },
                function() { $(this).css("background-color", ""); }
            );

            // tooltip with top products
            $('#paths>li').popover({
                delay: 500,
                placement: "bottom",
                content: function() {
                    var in_shipment = $(this).data();
                    var el = this;

                    loadShipments(in_shipment, function(in_shipments) {
                        var top_product = _(in_shipments).chain()
                            .groupBy(function(in_item) {
                                return in_item.product;
                            })
                            .map(function(val, key) { return { product: key, count: val.length }; })
                            .sortBy(function(item) { return -item.count; }).value();

                        // XXX: hack for update popover asyncly
                        $(el).attr("data-content", $("#top-product-template").tmpl({
                            top_product: top_product
                        })[0].innerHTML);
                        $(el).data('popover').setContent();
                    });
                    return "Подождите...";
                }
            });

            // to map
            drawShipmentPath({
                loc_from: shipment.from_station.loc,
                loc_to: shipment.to_station.loc,
                data: shipment,
                cb: function(loc, data) {
                    console.log("click?", loc, data);
                    onPathClick(data);
                },
                layer: shipment_layer,
                color: getColor(max, shipment.count),
                width: getWidth(max, total, shipment.count),
                opacity: getOpacity(max, shipment.count)
            });
        });

        unblockUI();
    });

    // Support map funcs (fro color, opacity, width)

    // TODO: trying use Bézier curve for that

    function getColor(max, cur) {
        var discrete = 10;
        var step = max / discrete;
        var r = 44, g = 60, b = 25;

        function pad(v) { if (v.length == 1) return "0" + v; else return v; };
        function toHEX(v) { return pad(Math.ceil(v % 255).toString(16)); };

        var cur = Math.ceil(cur/step);

        var color = "#" + toHEX(r + discrete*cur*2) + toHEX(g + discrete/cur) + toHEX(b);

        return color;
    }

    function getOpacity(max, cur) {
        var discrete = 10;
        var step = max / discrete;
        var addition = 0.1;

        if (cur/step > discrete/3)
            addition += 0.3;

        return addition + cur/step/10;
    }

    function getWidth(max, total, cur) {
        var discrete = 10;
        var step = max / discrete;
        var addition = 2;

        if (cur > 10)
            addition += 2;

        cur = Math.ceil(cur/step);

        // XXX: think about normal math formula, bitch!
        if (cur > discrete/2)
            addition += 2;

        if (cur > discrete/3)
            addition *= 2;

        if (cur > discrete/2)
            addition += 4;

        return addition + Math.ceil(cur/step);
    }

    // load and cache shipments path
    function loadShipments(shipment, cb) {
        if (shipment.shipments != null)
            return cb(shipment.shipments);

        $.getJSON("/v1/shipping/shipments", {
            from: shipment.from_station.name,
            to: shipment.to_station.name
        }, function(shipments) {
            shipments = _(shipments).sortBy(function(item) { return (new Date(item.invoice.date).getTime()); });
            shipments.forEach(function(item) {
                item.invoice.human_date = dateFormat(new Date(item.invoice.date), "dd.mm.yyyy HH:MM");
            });

            shipment.shipments = shipments;

            cb(shipments);
        });
    }

    function onPathClick(shipment) {
        return loadShipments(shipment, renderDialog);

        function renderDialog(shipments) {

            var $table = $("#dialog-template").tmpl({
                shipments: shipments,
                title: shipment.from_station.name + "->" + shipment.to_station.name +
                    " " + shipment.count + " (" + shipment.perc + "%)"
            });

            $table.dialog({
                resizable: true,
                width: 700,
                height: 500,
                zIndex: 9999, // fix osm control
                modal: true,
                buttons: {
                    "Закрыть": function() {
                        $(this).dialog("close");
                    }
                }
            });
        };
    };
}
