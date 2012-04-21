var db = require("../db/default-schema").Shipment;

module.exports = {
    get_group_by_path: function(req, res, next) {

	db.groupByPath(req.query.country, function(err, data) {
	    if (err)
		res.send(err);
	    else
		res.send(data);
	});
    }
}