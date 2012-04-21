var Step = require('step');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var opts = require('../../db-config.js');
var geocode_station = require("../geo/station.js").geocode_station;

mongoose.connect(opts["mongo-path"]);

var DTP = new Schema();

DTP.add({
    country_from: { type: String, index: true },
    invoice: {
        num: { type: String, index: true },
        status: String,
        date: { type: Schema.Types.Mixed, index: true }
    },
    from: String,
    to: String,

    from_station: station_pjs,
    to_station: station_pjs,

    train: {
        wagon: Number,
        container: Number
    },

    product: String,
    conductor: {
        name: String,
        passport_n: Number,
        passport_serial: Number
    }
});

// TODO: check for bad date, use regexp?
DTP.path("invoice.date").set(function(v) {
    var date_time = v.split(" ");
    var date = date_time[0].split(".");
    var time = date_time[1].split(":");

    return new Date(date[2], date[1], date[0],
                    time[0], time[1]);
});

// Add some converters for scheme

// Trying resolve station location
// first from DB
// second from geoservice (osm, google, yndx)
// XXX: USE ONLY DB RETRIEVE, IF NOT ADD IT
// GEOCODER RETRIEVE LATER
/*DTP.pre('save', function (next) {
    var from_station = this.from_station;
    var to_station = this.to_station;

    if (from_station.loc != undefined &&
        to_station.loc != undefined) {
        if (from_station.loc.lat != 0 &&
            from_station.loc.lon != 0 &&
            to_station.loc.lat != 0 &&
            to_station.loc.lon != 0)
            return next();
    }

    // else trying resolve it ...

    var Station_model = mongoose.model("Station");

    var fromDB = function(name, cb) {
        Station_model.findOne(
            { name: name },
            function(err, docs) {
                if (err) return cb(err);
                if (docs == null) return cb(new Error("Not found"));

                return cb(null, docs.loc);
            });
    };

    var fromGeocoder = function(name, cb) {
        geocode_station(name, function(err, data) {
            if (err) return cb(err);
            return cb(null, data);
        });
    };

    var insertStation = function(station, cb) {
        var new_station = new Station_model({
            name: station.name,
            loc: {
                lat: station.loc.lat,
                lon: station.loc.lon
            }
        });

        new_station.save(function(err) {
            cb(err);
        });
    };

    // XXX: use async (series, parallel) instead Step.
    Step(
        function resolveFromDB1() {
            var cb = this;

            fromDB(from_station.name, function(err, loc) {
                if (loc != undefined) {
                    from_station.loc.lat = loc.lat;
                    from_station.loc.lon = loc.lon;

                    console.log("From DB1", from_station.name);
                    return cb(null);
                }

                return cb(new Error("Loc not found"));
            });
        },
        function resolveFromGeocoder1(err) {
            var cb = this;

            if (err == null) return cb(null);

            fromGeocoder(from_station.name, function(err, loc) {
                if (loc != undefined) {
                    from_station.loc.lat = loc.lat;
                    from_station.loc.lon = loc.lon;
                    console.log("From GEO1", from_station.name);
                }

                // this new station, insert it
                insertStation(from_station, cb);
            });
        },
        function resolveFromDB2() {
            var cb = this;

            fromDB(to_station.name, function(err, loc) {
                if (loc != undefined) {
                    to_station.loc.lat = loc.lat;
                    to_station.loc.lon = loc.lon;

                    console.log("From DB2", to_station.name);
                    return cb(null);
                }

                return cb(new Error("Loc not found"));
            });
        },
        function resolveFromGeocoder2(err) {
            var cb = this;

            if (err == null) return cb(null);

            fromGeocoder(to_station.name, function(err, loc) {
                if (loc != undefined) {
                    to_station.loc.lat = loc.lat;
                    to_station.loc.lon = loc.lon;

                    console.log("From GEO2", to_station.name);
                }

                // this new station, insert it
                insertStation(to_station, cb);
            });
        },
        function(err) {
            console.log("From", from_station);
            console.log("To", to_station);

            next();
        }
    );
});
*/

DTP.statics.getCountries = function(cb) {
    return this.collection.distinct("country_from", cb);
};

DTP.statics.getShipmentCollection = function(from, to, cb) {
    return this
        .where('from_station.name', from)
        .where('to_station.name', to)
        .run(cb);
};

DTP.statics.getTimePeriod = function(country, cb) {
    var db = this;

    return this
        .where('country_from', country)
        .sort('invoice.date', -1)
        .limit(1)
        .run(function(err, max) {
            if (err || max == null) return cb(err);

            db.where('country_from' ,country)
                .sort('invoice.data', 1)
                .limit(1)
                .run(function(err, min) {
                    if (err || min == null) return cb(err);

                    cb(err, {
                        min: min[0].invoice.date,
                        max: max[0].invoice.date
                    });
                });
        });
};

// return only NON zero path location
DTP.statics.groupByPath = function(country, cb) {
    var cond = {
        $and: [
            { "from_station.loc.lat": { $ne : 0 } },
            { "to_station.loc.lat": { $ne : 0 } }
        ]
    };

    if (country) {
        cond["country_from"] = country;
    }

    return this.collection.group({
        "from_station": true,
        "to_station": true
    }, cond, {
        count: 0,
    }, function(obj, prev) {
        prev.count++;
    }, cb);
};

//

mongoose.model('DTP', DTP);

module.exports = {
    Shipment: mongoose.model('DTP'),
};
