var APIModule = require("../../APIModule");
var request = require("request");

var apiModule = new APIModule("nlptools");

var app = apiModule.app; // Express app
var usageLog = apiModule.usageLog;

// Sentiment analysis uses API from info at http://sentiment.vivekn.com/docs/api/
app.post("/nlptools/sentiment/single", function(req, res) {
	if ("txt" in req.body) {
		var text = req.body.txt;
		// this API requires a form upload with form encoded parameters
		// Use request module for form uploads
		req.pipe(request.post({
			"url": "http://sentiment.vivekn.com/api/text/",
			"form": {
				"txt": text
			}
		})).pipe(res); // Proxy the request with pipe()
	} else {
		res.json({
			"error": "Didn't include text request body. Request body must be of form {'txt':'text to analyze'}"
		});
	}
	usageLog.logUse("single_sentiment");
});

// Sentiment analysis uses API from info at http://sentiment.vivekn.com/docs/api/
// Same as /sentiment/single/ but for /batch/ post body needs to be a JSON array of text you want sentiment analysis on
app.post("/nlptools/sentiment/batch", function(req, res) {
	req.pipe(request.post({
		"url":"http://sentiment.vivekn.com/api/batch/",
		"body": JSON.stringify(req.body)
	})).pipe(res); // Proxy the request with pipe()
	usageLog.logUse("batch_sentiment");
});

// Summary extraction uses API from http://www.clipped.me/api.html
app.get("/nlptools/summarize", function(req, res) {
	if ("url" in req.query) {
		var url = req.query.url;
		var redirectURL = "http://clipped.me/algorithm/clippedapi.php?url=" + url; 
		req.pipe(request(redirectURL)).pipe(res);
	} else {
		res.json({
			"error": "Request url must contain parameter url=www.linktosometext.com"
		});
	}
	usageLog.logUse("summarize");
});

module.exports = apiModule;