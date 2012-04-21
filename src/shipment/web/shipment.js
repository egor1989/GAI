var db = require("../db/default-schema").Shipment;

module.exports = {
    get_shipments: function(req, res, next) {

	var from = req.query.from;
	var to = req.query.to;

	if (from == null || to == null)
	    return res.send("empty query, use 'from' and 'to'");

	db.getShipmentCollection(from, to, function(err, data) {
	    if (err)
		res.send(err);
	    else
		res.send(data);
	});
    }
};