var db = require("../../db/mongodb-store.js").db;

var schema_station = "station";

// only insert
// TODO: add upate or insert shipment data
exports.insert_shipment = function(schema, shipment, cb) {
    db.open(function(err) {
        if (err) throw err;

        db.collection(schema, function(error, collection) {
            collection.insert(shipment, {
                safe: true
            }, function(error) {
                if (error) {
                    console.log('something wrong: ' + error.message);
                }

                if (typeof cb == "function")
                    cb(error);
            });
        });
    });
};

// may be used for update?
exports.check_invoice = function(schema, invoice, cb) {
    db.open(function(err) {
        if (err) throw err;

        db.collection(schema, function(error, collection) {
            collection.find({
                invoice_num : invoice
            }, {
                safe: true
            }, function(error) {
                if (error) {
                    console.log('something wrong: ' + error.message);
                }

                if (typeof cb == "function")
                    cb(error);
            });
        });
    });
}

// insert or update station
exports.update_station = function(station, cb) {
    var name = station.name;
    var loc = station.loc;
    var metadata = station.metadata;

    db.open(function(err) {
        if (err) throw err;

        db.collection(schema_station, function(error, collection) {
            collection.update({
                name: name,
            }, {
                name: name,
                loc: loc,
                metadata: metadata
            }, {
                upsert: true,
                safe: true
            }, function(err) {
                cb(err);
            });
        });
    });
}

exports.db_close = function() {
    db.close();
}

function get_stations(query, cb) {

    db.open(function(err) {
	if (err) throw err;

	db.collection(schema_station, function(err, collection) {
	    collection.find(query).toArray(function(err, data) {
		if (err) return cb(err);

		cb(null, data);
	    });
	});
    });
};

exports.get_stations = function(cb) {
    return get_stations({}, cb);
};

exports.get_unresolved_stations = function(cb) {
    return get_stations({
	loc : {
	    lat: 0,
	    lon: 0
	}
    }, cb);
};