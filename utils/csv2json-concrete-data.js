var fs = require('fs');
var path = require('path');
var csv = require('csv');

var opts = process.argv.slice(2);

var input_file = opts[0];
var output_file = opts[1];

if (input_file == undefined || output_file == undefined) {
    console.log("script <in> <out>");
    process.exit(-1);
}

var result = [];
var metadata = {};

csv()
    .from.path(/*__dirname + "/" +*/ input_file, {
	    delimiter: ';',
	    trim: true
	})
    .transform(function(data, index){
	if (parseHeader(data, index)) {
            return;
        }

        if (isEmpty(data)) {
            return;
        }

        result.push(data);
    })
    .on('end',function(count){
        console.log('Number of lines: '+count, result.length);

        fs.open(output_file, "w+", function(err, fd) {
            if(err) throw err;

            var toFile = {
                metadata: metadata,
                // last element is total, remove it
                events: result.slice(0, result.length - 1)
            };

            fs.write(fd, JSON.stringify(toFile, null, '\t'));
            fs.close(fd);
        });
    })
    .on('error',function(error){
        console.log(error.message);
    });

function parseHeader(data, index) {
    if (index == 0) { // КАРТОЧКА УЧЕТА ДТП ...
        metadata.name = data[0].trim();
    }

    if (index == 1) { // по месту совершения по Ленинградской области ...
        metadata.where_country = data[0].trim();
    }

    if (index == 2) { // Федеральная дорога 11 ...
        metadata.where_road = data[0].trim();
    }

    if (index == 3) { // за первый квартал 2012 года ..
        metadata.date = data[0].trim();
    }

    if (index == 4) { // empty
    }

    if (index == 5) { // ;;;;;;;;;;;;Причины ;;;;;Посл.;;;
    }

    if (index == 6) { // ;;;;;;;;;;;;ДТП;;;;;;;в т.ч.  дети;
    }

    if (index == 7) { // main header
    }

    if (index == 8) { // 1 - 12 digit (??? odf parser?)
    }

    // Say that metadata
    if (index <= 8)
        return true;

    return false;
}

function isEmpty(data) {
    var all_empty = true;

    for (var idx = 0; idx < data.length; idx++) {
        if (data[idx].trim() != "") {
            all_empty = false;
            break;
        }
    }

    return all_empty;
}