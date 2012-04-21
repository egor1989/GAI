var mongoose = require('mongoose');
var Shipment = require('../src/shipment/db/default-schema.js').Shipment;

Shipment.groupByPath("", console.log);

// Shipment.getCountries(console.log);
// Shipment.getShipmentCollection("ДУШАНБЕ II", "СТЕРЛИТАМАК", console.log);
