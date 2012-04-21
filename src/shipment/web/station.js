var update_station = require("../db/shipment").update_station;

module.exports = {
    remvoe_station: function(req, res, next) {
	// TODO:
    },

    update_station: function (req, res, next) {
	var data = req.body;

	if (data == undefined) {
            console.log("data undefined");
            res.end();
            return;
	}

	var name = data.name;
	var loc = data.loc;

	update_station({
            name: name,
            loc: loc,
            metadata: {}
	}, function(err) {
            if (err) {
		res.send(err);
            }
            res.end();
	});

    }
}
