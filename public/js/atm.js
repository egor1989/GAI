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

function mainApp() {

    // XXX: additional pre req
    fixFullHeight("map");
    fixFullHeight("tx-list");

    // TODO: use storage
    loadScript("js/data/tx/atmt-dima.json");

    window.atm_layer = new OpenLayers.Layer.Markers("ATM", {});
    map.addLayer(atm_layer);

    // from 'js/data/atmt-dima.json'
    var currentData = atmt_dima;

    // XXX: use real array id?
    var idx = 0;
    currentData.map(function(e) { e.push(idx++); });

    currentData.forEach(function(tx) {
        var $tx = $.template("<li data-id='${id}' class='not-found'><span>${date} - ${desc}</span></li>");

        $.tmpl($tx, {
            id: tx[name2idx["id"]],
            date: tx[name2idx["date"]],
            desc: tx[name2idx["description"]]
        }).appendTo('#tx-list');

        var address = tx[name2idx["city"]] + " " + tx[name2idx["country"]];
        resolveLocationByAddress(address, function(loc) {
            if (loc != undefined) {
                putOnMap({
                    loc: loc,
                    data: tx,
                    cb: showTxPopup,
                    layer: atm_layer
                });
                tx.push(loc);
                // XXX: gen event for trigger this
                $('li[data-id=' + tx[name2idx["id"]] + ']').removeClass("not-found");
            } else {
                console.error("tx for city+country not found", address, tx);

                // trying for country
                resolveLocationByAddress(tx[name2idx["country"]], function(country_loc) {
                    if (country_loc != undefined) {
                        putOnMap({
                            loc: country_loc,
                            data: tx,
                            cb: showTxPopup,
                            marker_url: tx_map.config.notfound_tx_marker,
                            layer: atm_layer
                        });

                        tx.push(country_loc);
                        // XXX: and too
                        $('li[data-id=' + tx[name2idx["id"]] + ']').removeClass("not-found");
                        $('li[data-id=' + tx[name2idx["id"]] + ']').addClass("country-found");
                    } else {
                        console.error("and for city too not found", tx);
                    }
                });
            }
        });
    });

    // localStorage.setItem("what", JSON.stringify(currentData));

    $("#tx-list>li").live("click", function() {
        var idx = $(this).attr("data-id");
        var tx = currentData[idx];

        if (tx[name2idx["loc"]] == undefined) {
            // TODO: show pop up with not resolverd data
            console.error("tx location not resolved", tx);
            return;
        }

        var lat = tx[name2idx["loc"]].lat;
        var lon = tx[name2idx["loc"]].lon;

        map.setCenter(new OpenLayers.LonLat(lon, lat).transform(
            new OpenLayers.Projection("EPSG:4326"), new OpenLayers.Projection(
                "EPSG:900913")));

        showTxPopup(tx);
    });
};
