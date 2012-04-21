// XXX: trying geocode through google, yandex
function resolveLocationByAddress (address, cb, opts) {
    opts = opts || {};

    $.ajax({
        url: tx_map.config.osm_nominatim,
        data: {
            format: 'json',
            q: address
        },
        success: function(data) {
            var one = undefined;

            if (data != undefined && data.length > 0) {
                one = {
                    lat: +data[0].lat + Math.random() / 1000,
                    lon: +data[0].lon + Math.random() / 1000,
                    display_name: data[0].display_name
                };
            }

            if (opts.all)
                cb(data);
            else
                cb(one);
        },
        error: function(e, error) {
            cb(null);
        }
    });
}

// XXX: throw exception? more cleanly
function resolveShipmentPath(station_one, station_two, cb) {
    resolveTrainStationLocation(
        station_one,
        function(from_loc) {
            if (from_loc == undefined) {
                console.log("Station resolve failed", station_one);
            }

            resolveTrainStationLocation(
                station_two,
                function(to_loc) {
                    if (to_loc == undefined) {
                        console.log("Station resolve failed", station_two);
                    }
                    cb({
                        from: from_loc,
                        to: to_loc
                    });
                });
        });
}

function resolveTrainStationLocation(station, cb) {

    // filtrate
    station = station.replace("(ЭКСП.)", "").trim();

    var train_station = {
        "СЕРХЕТАБАТ": {
            lat: "35.275833343333",
            lon: "62.341666676667"
        },
        "ЧЕЛЯБИНСК-ГРУЗОВОЙ": {
            lat: "55.084591",
            lon: "61.390741"
        },
        "НОВОЯРОСЛАВСКАЯ" : {
            lat: "57.591229",
            lon: "39.832035"
        },
        "МУУГА": {
            lat: "59.479164",
            lon: "24.949665"
        }
    };

    var manual_station = train_station[station];

    if (manual_station != undefined) {
        cb(manual_station);
        return;
    }

    resolveLocationByAddress(station, function(data) {
        if (data == null) {
            cb(null);
            return;
        }

        if (data.length == 1) {
            cb(data[0]);
            return;
        }

        if (data.length > 1) {
            // Find more properly data
            // class == railway or type == station

            var idx = 0;
            var by_meta_found = false;

            for (idx = 0; idx < data.length; idx++) {
                if (data[idx]["class"] == "railway") {
                    by_meta_found = true;
                    break;
                }

                if (data[idx]["type"] == "station") {
                    by_meta_found = true;
                    break;
                }
            }

            if (by_meta_found)
                cb(data[idx]);
            else
                cb(null);
        }
    }, { all: true });
}

// adjust height: save 115 top, and 115 bottom
// XXX: ?
function fixFullHeight(id) {
    $("#" + id).css("height", screen.availHeight - 230);
}
