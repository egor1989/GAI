var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var opts = require('../../db-config.js');

mongoose.connect(opts["mongo-path"]);

// Road Traffic Collision collection
var RTC = new Schema();

// XXX: check for duplicity and consistensy
RTC.add({
    reg_num: { type: String, index: true },
    date: { type: Schema.Types.Mixed, index: true },
    type: { type: String },
    where: {
	district: { type: String },
	place: { type: String },
	// XXX: Trying resolve it
	loc: {
	    lat: { type: Number, default: 0.0 },
	    lon: { type: Number, default: 0.0 }
	}
    },
    road: {
	type: { type: String },
	cond: { type: String },
	surface_cond: { type: String },
	light: { type: String }
    },
    weather_cond: { type: String },
    // XXX: All causes is number (unique?)
    // maybe save ONLY ONE number as cause
    cause: {
	driver: { type: String },
	ped: { type: String },
	road: { type: String },
	car: { type: String },
	other: { type: String }
    },
    effect: {
	people: {
	    hurt: { type: Number },
	    died: { type: Number }
	},
	children: {
	    hurt: { type: Number },
	    died: { type: Number }
	}
    }
});

// TODO: check for bad date, use regexp?
// XXX: excel from OOo and MS diffs!
RTC.path("date").set(function(v) {
    var date_time = v.split(" ");
    var date = date_time[0].split(".");
    var time = date_time[1].split(",");

    // XXX: temporary hack
    if (time.length != 2)
	time = date_time[1].split(".");

    var year = "20" + date[2];
    return new Date(year, date[1], date[0],
                    time[0], time[1]);
});

RTC.statics.getAll = function(cb) {
    return this.find(cb);
};

RTC.statics.getAllDied = function(cb) {
    return this
	.where("effect.children.died").gt(0)
	.or()
	.where("effect.people.died").gt(0)
	.run(cb);
};

mongoose.model('RTC', RTC);

module.exports = {
    RTC: mongoose.model('RTC'),
};
