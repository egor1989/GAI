var db = require("../db/default-schema").RTC;

exports.all = function(req, res) {

    db.getAll(function(err, data) {
	if (err)
            res.send(err);
        else
            res.send(data);

	res.end();
    });
};

exports.allDied = function(req, res) {

    db.getAllDied(function(err, data) {
	if (err)
            res.send(err);
        else
            res.send(data);

	res.end();
    });
};
