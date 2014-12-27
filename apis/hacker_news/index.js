var APIModule = require("../../APIModule");

var apiModule = new APIModule("hacker_news");

var app = apiModule.app; // Express app
var usageLog = apiModule.usageLog;

// Uses Firebase API for Hacker News
// Documentation is on github readme: https://github.com/HackerNews/API

app.get("/hacker_news/top", function (req, res) {
	res.redirect("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty");
	usageLog.logUse("top");
});

app.get("/hacker_news/item/:itemID", function (req, res) {
	if ("itemID" in req.params) {
		var itemID = req.params.itemID;
		var redirectURL = "https://hacker-news.firebaseio.com/v0/item/" + itemID + ".json?print=pretty";
		res.redirect(redirectURL);
	} else {
		res.json({
			"error":"Didn't specify itemID in request url"
		});
	}
	usageLog.logUse("item");
});

app.get("/hacker_news/user/:username", function(req, res) {
	if ("username" in req.params) {
		var username = req.params.username;
		var redirectURL = "https://hacker-news.firebaseio.com/v0/user/" + username + ".json?print=pretty";
		res.redirect(redirectURL);
	} else {
		res.json({
			"error":"Didn't specify username in request url"
		});
	}
	usageLog.logUse("user");
});

// All API modules must set module.exports as the following
module.exports = apiModule;