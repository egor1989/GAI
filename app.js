
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');

var crypto = require('crypto');

var users = require('./users');

var path = require('./src/shipment/web/path');
var shipment = require('./src/shipment/web/shipment');
var country = require('./src/shipment/web/country');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function() {
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// simple auth
// TODO: trying use everyauth modue
function checkAuth(req, res, next) {
    var sess = req.cookies.tx_session;

    if (sess == undefined)
        return res.redirect('/login');

    for(var cnt = 0; cnt < users.length; cnt++)
        if (users[cnt].session == sess)
            return next();

    return res.redirect('/login');
}

// Routes

app.get('/logout', function(req, res, next) {

    res.clearCookie('TX_SESSION');
    res.clearCookie('LOGIN');

    res.redirect('/');
});

app.get('/login', function(req, res, next) {
    res.render('login', {
        title: "Login"
    });
});

app.post('/login', function(req, res, next) {
    var user = req.body.user;
    var pwd = req.body.pwd;
    var found = false;
    var cnt = 0;

    for (cnt = 0; cnt < users.length; cnt++) {
        if (users[cnt].user == user && users[cnt].pwd == pwd) {
            found = true;
            break;
        }
    }

    if (!found)
        return res.render("login", {
            title: "Login",
            errors: [ "Неправильная пара логин/пароль" ]
        });

    var secret = "y8tHachup4aPhaKUThA3$USWa";

    var shasum = crypto.createHash('sha1');
    shasum.update(user + pwd + secret);

    users[cnt].session = shasum.digest('hex');

    var oneDay = 60*60*24*1000;

    res.cookie('TX_SESSION', users[cnt].session, {
        expires: new Date(Date.now() + oneDay),
        httpOnly: true
    });
    res.cookie('LOGIN', users[cnt].user, {
        expires: new Date(Date.now() + oneDay),
        httpOnly: true
    });

    res.redirect('/');
});

// Pages

app.all('*', function(req, res, next) {
    if (/^\/vendor\//.test(req.path) ||
        /^\/css\//.test(req.path) ||
        /^\/js\//.test(req.path) ||
        /^\/img\//.test(req.path))
        return next();

    return checkAuth(req, res, next);
});

app.get('/', routes.index);

app.get('/atm', routes.atm);

app.get('/shipping', routes.countries);
app.get('/shipping/detail', routes.shipping);

// Api
app.get('/v1/shipping/paths', path.get_group_by_path);
app.get('/v1/shipping/shipments', shipment.get_shipments);
app.get('/v1/shipping/country/period', country.get_time_period);

// Main update from server side. May be use for manual updating?
//app.post('/shipping/station/', station.update_station);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
