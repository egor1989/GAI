var http = require('http');
var querystring = require('querystring');

function http_request(opts, cb) {
    http.get( opts, function ( response ) {
	var data = "", result;

	response.on("error", function ( err ) {
	    return cb( err );
	});

	response.on("data", function ( chunk ) {
	    data += chunk;
	});

	response.on("end", function ( argument ) {
	    result = JSON.parse( data );
	    return cb( null, result );
	});

    }).on("error", function (err) {
	return cb( err );
    });
}

module.exports = {
    geocode_by_osm: function(address, cb) {
	var opts = {
	    port: 80,
	    host: "nominatim.openstreetmap.org",
	    path: "/search?" + querystring.stringify({
		format: 'json',
		q: address
	    })
	};

	http_request(opts, cb);
    },

    geocode_by_google: function(address, cb) {
	var opts = {
	    host: 'maps.googleapis.com',
	    port: 80,
	    path: '/maps/api/geocode/json?' + querystring.stringify({
		address: address,
		sensor: false
	    })
	};

	http_request(opts, cb);
    },

    geocode_by_yandex: function() {
    }
};