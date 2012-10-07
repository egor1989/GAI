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

	if (index == 0) {
	    metadata.description = data[0];
	    return;
	}

	if (index == 1) {
	    metadata.timespan = data[0];
	    return;
	}

	if (filtrate(data, index)) {
	    return;
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

    console.error("Format not supported");

    process.exit(1);
}

function parseLine(data, index) {
    if (input_file.match("Таблица 1")) {
	return table1Format(data);
    }

    if (input_file.match("Таблица 2")) {
	return table2Format(data);
    }

    console.error("Format not supported");

    process.exit(1);
}

function table2Format(data) {
    var result = {};

    metadata.type = "table2";

    result.region = data[0]; // Регион

    result.rtc_total = data[1];  // Всего ДТП
    result.injury_total = data[2]; // Всего постардавших

    result.vehicle_total = data[3]; // Всего ед. ТС
    result.population_total_k = data[4]; // Всего жителей тыс

    result.rtc_by10kk_abs = data[5]; // Количество ДТП на 10 тыс. ед. ТС абс
    result.rtc_by10kk_mean = data[6]; // Количество ДТП на 10 тыс. ед. ТС % от среднего по России

    result.injury_by100kk_abs = data[7]; // Число пострадавших на 100 тыс. жителей абс
    result.injury_by100kk_mean = data[8]; // Число пострадавших на 100 тыс. жителей % от среднего по России

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