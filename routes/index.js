var db = require("../src/shipment/db/default-schema").Shipment;

/*
 * GET home page.
 */

exports.index = function(req, res){
    res.render('index', {
      login: req.cookies.login,
        title: 'TX'
    });
};

exports.countries = function(req, res){
    db.getCountries(function(err, data) {
        res.render('countries', {
            login: req.cookies.login,
            title: 'Shipping tx',
            countries: data
        });
    });
};

exports.shipping = function(req, res){
    var country = req.query.country;

    res.render('shipping', {
        login: req.cookies.login,
        title: req.query.country,
        country: req.query.country,
    });
};

exports.atm = function(req, res){
  res.render('atm', {
      title: 'ATM tx',
      login: req.cookies.login
  });
};