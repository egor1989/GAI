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

// adjust height: save 115 top, and 115 bottom
// XXX: ?
function fixFullHeight(id) {
    $("#" + id).css("height", screen.availHeight - 230);
}
