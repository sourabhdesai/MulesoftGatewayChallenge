var fs = require('fs');
var LOGS_DIRECTORY = "./usage_logs/";

// This is NOT THREAD SAFE
// Should be fine since Node.js environment is single threaded on developer's level

var UsageLogger = function (logFilename, writeDelay) {
	this.usages = {};
	this.staleDisk = false;

	this.logFilePath = LOGS_DIRECTORY + logFilename;

	if (fs.existsSync(this.logFilePath))
		this.usages = require("." + this.logFilePath); // Blocking IO but ok if only on server start up

	UsageLogger.prototype.writeToDisk = function() {
		if (this.staleDisk) {
			var instance = this; // need outside reference of this for writeFile cb function
			var usageString = JSON.stringify(this.usages, null, "\t");
			fs.writeFile(this.logFilePath, usageString, function (err) {
				if (err)
					console.log("Error in writing file:\n", err);
				else
					instance.staleDisk = false;
			});
		}
	};

	// route: (String) API route that you want to log a use of
	UsageLogger.prototype.logUse = function(route) {
		this.staleDisk = true;
		if (route in this.usages)
			this.usages[route]++;
		else
			this.usages[route] = 1;
	};

	UsageLogger.prototype.getUsage = function() {
		return this.usages;
	};

	// Periodicaly write log of API usage to disk on interval of length writeDelay
	var instance = this; // need outside reference of this for setInterval cb function
	setInterval(function() {
		instance.writeToDisk();
	}, writeDelay);
};

module.exports = UsageLogger;