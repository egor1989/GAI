
/**
 * Module dependencies.
 */

var coffee = require('coffee-script');
var express = require('express');

var users = require('./users');


var app = module.exports = express.createServer();


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


require('./routes/admin')(app);
var routes = require('./routes');

app.get('/', routes.index);


// Api
// TODO: by what? date, region, road... or custom query?

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
