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
    .fromPath(/*__dirname + "/" +*/ input_file, { delimiter: ';' })
    .transform(function(data, index){
        return data;
    })
    .on('data',function(data,index){

	if (isEmpty(data)) {
	    return;
        }

	if (data[0].length < 2) {
	    console.log("skip", data);
	    return false;
	}

	if (index < 3) {
	    console.log("skip", data);
	    return;
	}

        result.push(parseLine);
    })
    .on('end',function(count){
        console.log('Number of lines: '+count);

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

function parseLine(data, index) {
    var result = {};

    result.region = data[0].trim(); // Регион

    result.rtc_abs = data[1].trim();  // ДТП абс.
    result.rtc_appg = data[2].trim(); // ДТП % к АППГ

    result.died_abs = data[3].trim(); // Погибло абс.
    result.died_appg = data[4].trim(); // Погибло АППГ

    result.injury_abs = data[5].trim(); // Ранено абс.
    result.injury_appg = data[6].trim(); // Ранено АППГ

    result.weight = data[7].trim(); // Тяжесть послед. ДТП

    return result;
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