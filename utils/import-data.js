var fs = require('fs');
var mongoose = require('mongoose');
var Shipment = require('../src/shipment/db/default-schema.js').Shipment;

var opts = process.argv.slice(2);

// Default csv file schema
var csv_schema = {
    number: 0, // "Порядковый номер",
    dtp_num : 1, // "Регистрационный номер ДТП",
    dtp_date : 2, // "Дата ДТП",
    dtp_time : 3, // "Время ДТП",
    dtp_type : 4, // "Вид ДТП",
    dtp_district : 5, // "Район",
    dtp_place : 6, // "Место совершения ДТП",
    road_type : 7, // "Тип дорожного полотна",
    surface_condition : 8, // "Состояние проезжей части",
    light : 9, // "Освещенность",
    weather_condition  : 10, // "Погодные условия",
    road_condition : 11, // "Дорожные условия",
    cause_is_driver : 12, // "Причина - водитель",
    cause_is_ped : 13 // "Причина - пешеход",
    cause_is_road : 14, // "Причина - дорожные условия",
    cause_is_car : 15, // "Причина - неисправность а/м",
    cause_is_other : 16 // "Прочие причины",
    people_hurt : 17 // "Человек ранено",
    people_died : 18, // "Человек погибло",
    children_hurt : 19, // "Детей ранено",
    children_died : 20 // "Детей погибло"
};

mainWork();

function mainWork() {
    var data = require("./" + opts[0]);

    function asyncLoop(i) {
	if( i < data.length ) {
	    addDTP(data[i], opts[0], function(err) {
		if (err)
		    console.log(err);
		asyncLoop(i + 1);
	    });
	}
    }
    asyncLoop(0);
}

function addDTP(item, fileName, cb) {
    var dtp = new DTP({
	road_name: fileName,
	invoice: {
	    num: item[csv_schema.dtp_num],
	    status: item[csv_schema.invoice_status],
	    date: item[csv_schema.invoice_date]
	},

	from: item[csv_schema.from],
	to: item[csv_schema.to],

	from_station: {
	    name: item[csv_schema.from_station]
	},
	to_station: {
	    name: item[csv_schema.to_station]
	},

	train: {
	    wagon: item[csv_schema.wagon_num],
	    container: item[csv_schema.container_num]
	},

	product: item[csv_schema.product_name],

	conductor: {
	    name: item[csv_schema.conductor_name],
	    passport_n: item[csv_schema.conductor_passport_num],
	    passport_serial: item[csv_schema.conductor_passport_serial]
	}
    });

    shipment.save(function(err) {
	cb(err);
    });
}