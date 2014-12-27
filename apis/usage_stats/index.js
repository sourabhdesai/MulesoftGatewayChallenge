var express = require('express');

module.exports = function (apis) {
	var apiUsages = {}; // key value map of api name to api usage object
	apis.forEach(function (api) {
		apiUsages[api.name] = api.usageLog.getUsage(); // Copy pointer to usage object that is being updated
	});

	var app = express();

	app.get('/usage/:api', function (req, res) {
		var api = req.params.api;
		if (api in apiUsages)
			res.json(apiUsages[api]);
		else {
			res.status(404);
			res.json({
				"error": "No API with label '" + api + "'"
			});
		}
	});

	return app;
};