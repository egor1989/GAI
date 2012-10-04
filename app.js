
/**
 * Module dependencies.
 */

var coffee = require('coffee-script');
var express = require('express');

var users = require('./users');


var app = module.exports = express.createServer();

var admin = require('./routes/admin')(app);
var routes = require('./routes');

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.set('users', users);
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
        return res.redirect('/admin/login');

    for(var cnt = 0; cnt < users.length; cnt++)
        if (users[cnt].session == sess)
            return next();

    return res.redirect('/admin/login');
}

// Routes

app.get('/admin/logout', admin.logout);
app.get('/admin/login', admin.login);
app.post('/admin/login', admin.login);



// Pages

app.all('^/admin*$', function(req, res, next) {
    if (/^\/vendor\//.test(req.path) ||
        /^\/css\//.test(req.path) ||
        /^\/js\//.test(req.path) ||
        /^\/img\//.test(req.path))
        return next();

    return checkAuth(req, res, next);
});


app.get('/', routes.index);
app.get('/admin/?(index)?', admin.index);


// Api
// TODO: by what? date, region, road... or custom query?

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
