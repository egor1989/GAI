var geocode = require('../../geo/geocode');

// XXX: Store it?
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

// TODO: now only for osm
function find_rail_station(data) {
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
        return data[idx];

    return null;
}

module.exports = {
    geocode_station: function(station, cb, opts) {
	// TODO: add func for filtering
	station = station.replace("(ЭКСП.)", "").trim();

	var manual_station = train_station[station];

	if (manual_station != undefined) {
            cb(null, manual_station);
            return;
	}

	return geocode.geocode_by_osm(station, function(err, data) {
	    if (err)
		return cb(err);

	    var station_loc = find_rail_station(data);

	    if (station_loc != null)
		return cb(null, station_loc);

	    return cb("nothing found for '" + station + "'");
	});
    },
};
