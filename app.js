
/**
 * Module dependencies.
 */

var express = require('express');
var crypto = require('crypto');

var routes = require('./routes');
var users = require('./users');

var rest = require('./src/rtc/web/rest');

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

    // Disable auth
    return next();

    //return checkAuth(req, res, next);
});

app.get('/', routes.index);

// Api
// TODO: by what? date, region, road... or custom query?

app.get('/rest/all', rest.all);
app.get('/rest/all/died', rest.allDied);

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
