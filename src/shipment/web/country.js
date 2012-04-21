var db = require("../db/default-schema").Shipment;

module.exports = {
    get_countries: function(req, res, next) {

        db.getCountries(function(err, data) {
            if (err)
                res.send(err);
            else
                res.send(data);
        });
    },
    get_time_period: function(req, res, next) {
        db.getTimePeriod(req.query.country, function(err, data) {
            if (err)
                res.send(err);
            else
                res.send(data);
        });
    }
};