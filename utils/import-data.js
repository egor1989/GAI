var fs = require('fs');
var mongoose = require('mongoose');
var RTC = require('../src/rtc/db/default-schema.js').RTC;

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
    cause_is_ped : 13, // "Причина - пешеход",
    cause_is_road : 14, // "Причина - дорожные условия",
    cause_is_car : 15, // "Причина - неисправность а/м",
    cause_is_other : 16, // "Прочие причины",
    people_hurt : 17, // "Человек ранено",
    people_died : 18, // "Человек погибло",
    children_hurt : 19, // "Детей ранено",
    children_died : 20 // "Детей погибло"
};

mainWork();

function mainWork() {
    // XXX: USE METADATA TOO
    // like a schema name? split by time period? or region location?
    var data = require(opts[0]);

    console.log("Starting import:\n\n", data.metadata, "\n");

    function asyncLoop(i) {
	if( i < data.events.length ) {
	    addRTC(data.events[i], opts[0], function(err) {
		if (err)
		    console.log(err);
		asyncLoop(i + 1);
	    });
	} else {
	    console.log("Import done", i, "entries");
	}
    }
    asyncLoop(0);
}

// XXX: use temporary schema, add verifyer? or simple googling
// simple transaction for mongodb
function addRTC(item, fileName, cb) {
    // '-' is empty or null?
    for (var idx = 0; idx < item.length; idx++) {
	if (item[idx] == '-')
	    item[idx] = '';
    }

    var rtc = new RTC({
	reg_num: item[csv_schema.dtp_num],
	date: item[csv_schema.dtp_date] + " " + item[csv_schema.dtp_time],
	type: item[csv_schema.dtp_type],
	where: {
	    district: item[csv_schema.dtp_district],
	    place: item[csv_schema.dtp_place],
	},
	road: {
	    type: item[csv_schema.road_type],
	    cond: item[csv_schema.road_condition],
	    surface_cond: item[csv_schema.surface_cond],
	    light: item[csv_schema.light]
	},
	weather_cond: item[csv_schema.weather_cond],
	cause: {
	    driver: item[csv_schema.cause_is_driver],
	    ped: item[csv_schema.cause_is_ped],
	    road: item[csv_schema.cause_is_road],
	    car: item[csv_schema.cause_is_car],
	    other: item[csv_schema.cause_is_other],
	},
	effect: {
	    people: {
		hurt: item[csv_schema.people_hurt],
		died: item[csv_schema.people_died]
	    },
	    children: {
		hurt: item[csv_schema.children_hurt],
		died: item[csv_schema.children_died]
	    }
	}
    });

    rtc.save(function(err) {
	cb(err);
    });
}
