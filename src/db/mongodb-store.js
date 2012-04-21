var fs = require('fs');
var mongodb = require("mongodb");
var options = require("../db-config.js");

var mongo = new mongodb.Server(options["mongo-host"],
			       options["mongo-port"]);

var db = exports.db = new mongodb.Db(options["mongo-database"], mongo);
