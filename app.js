
/**
 * Module dependencies.
 */

var express    = require('express');
var http       = require('http');
var path       = require('path');
var usageStats = require('./apis/usage_stats');

// Require in the API modules
var hackerNews = require('./apis/hacker_news');
var nlpTools   = require('./apis/nlptools');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// Add API Routes
// Every API module for this gateway can be integrated by being added to the apiApps array
var apis = [hackerNews, nlpTools];
apis.forEach(function(api) {
	app.use(api.app);
});

// Usage statistics route
app.use(usageStats(apis));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res) {
	res.send("Server is Online :)");
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
