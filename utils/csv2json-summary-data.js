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

var csv = require('csv');

csv()
    .from.path(/*__dirname + "/" +*/ input_file, {
	delimiter: ';',
	trim: true
    })
    .transform(function(data, index){
	if (isEmpty(data)) {
	    return;
        }

	if (parseMetadata(data, index)) {
	    return true;
	}

	if (filtrate(data, index)) {
	    return true;
	}

        result.push(parseLine(data));
    })
    .on('end',function(count) {
        console.log('Number of lines:', count, result.length);

        fs.open(output_file, "w+", function(err, fd) {
            if(err) throw err;

            var toFile = {
                data: result,
		metadata: metadata
            };

            fs.write(fd, JSON.stringify(toFile, null, '\t'));
            fs.close(fd);
        });
    })
    .on('error',function(error){
        console.log(error.message);
    });

function parseMetadata(data, index) {
    if (input_file.match("Таблица 1")
	|| input_file.match("Таблица 2")
	|| input_file.match("Водит")) {
	if (index == 0) {
	    metadata.description = data[0];
	    return true;
	}

	if (index == 1) {
	    metadata.timespan = data[0];
	    return true;
	}
    }

    if (input_file.match("Нетрез")
	|| input_file.match("Юрид")) {
	if (index == 0) {
	    metadata.description = data[0];
	    return true;
	}

	if (index == 1) {
	    metadata.description += " " + data[0];
	    return true;
	}

	if (index == 2) {
	    metadata.timespan = data[0];
	    return true;
	}
    }

    return false;
}

function filtrate(data, index) {

    if (input_file.match("Таблица 1")) {
	if (data.length != 9) {
	    console.log("skip !=9 ", data, index);
	    return true;
	}

	if (data[0].length < 2) {
	    console.log("skip len <2 ", data, index);
	    return true;
	}

	if (index < 4) {
	    console.log("skip idx < 4", data, index);
	    return true;
	}

	return false;
    }

    if (input_file.match("Таблица 2")) {
	if (data.length != 21) {
	    console.log("skip !=21 ", data, index);
	    return true;
	}

	if (data[0].length < 2) {
	    console.log("skip len <2 ", data, index);
	    return true;
	}

	if (index < 4) {
	    console.log("skip idx < 4", data, index);
	    return true;
	}

	return false;
    }

    if (input_file.match("Нетрез")
	|| input_file.match("Водит")
	|| input_file.match("Юрид")) {
	if (data.length != 9) {
	    console.log("skip !=9 ", data, index);
	    return true;
	}

	if (data[0].length < 2) {
	    console.log("skip len <2 ", data, index);
	    return true;
	}

	if (index < 3) {
	    console.log("skip idx < 3", data, index);
	    return true;
	}
	return false;
    }

    console.error("Format not supported (filter)", input_file);

    process.exit(1);
}

function parseLine(data, index) {
    if (input_file.match("Таблица 1")) {
	return table1Format(data);
    }

    if (input_file.match("Таблица 2")) {
	return table2Format(data);
    }

    if (input_file.match("Нетрез")) {
	return drunkFormat(data);
    }

    if (input_file.match("Водит")) {
	return pddFormat(data);
    }

    if (input_file.match("Юрид")) {
	return jurFormat(data);
    }

    console.error("Format not supported", input_file);

    process.exit(1);
}

function jurFormat(data) {
    var result = {};

    result = drunkFormat(data);
    metadata.type = "juridical";

    return result;
}

function pddFormat(data) {
    var result = {};

    result = drunkFormat(data);
    metadata.type = "pdd";

    return result;
}

function drunkFormat(data) {
    var result = {};

    metadata.type = "drunk";

    result.region = data[0]; // Регион

    result.rtc_abs = data[1];  // ДТП абс.
    result.rtc_appg = data[2]; // ДТП % к АППГ
    result.weight_unit = data[3]; // ДТП удельный вес


    result.died_abs = data[4]; // Погибло абс.
    result.died_appg = data[5]; // Погибло % к АППГ

    result.injury_abs = data[6]; // Ранено абс.
    result.injury_appg = data[7]; // Ранено % к АППГ

    result.unknown = data[8]; // Неизвестный параметр (в excel нет инфы)

    return result;
}

function table1Format(data) {
    var result = {};

    metadata.type = "table1";

    result.region = data[0]; // Регион

    result.rtc_abs = data[1];  // ДТП абс.
    result.rtc_appg = data[2]; // ДТП % к АППГ

    result.died_abs = data[3]; // Погибло абс.
    result.died_appg = data[4]; // Погибло АППГ

    result.injury_abs = data[5]; // Ранено абс.
    result.injury_appg = data[6]; // Ранено АППГ

    result.weight = data[7]; // Тяжесть послед. ДТП

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