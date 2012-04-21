var station = require('station.js');

module.exports = {
    // XXX: use Step for avoiding nesting callbacks
    geocode_shipment: function(from_station, to_station, cb) {
	geocode_station(from_station, function(err, from_loc) {
	    if (err) return cb(err);

	    geocode_station(to_station, function(err1, to_loc) {
		// XXX: maybe return semi result?
		if (err1) return cb(err1);

		cb(null, {
		    from_loc: from_loc,
		    to_loc: to_loc
		});
	    });
	});
    }
}
