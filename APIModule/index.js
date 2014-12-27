var UsageLogger = require("../UsageLogger");
var express = require("express");

var DEFAULT_WRITE_DELAY = 20000; // Time between writing api usage to disk in milliseconds

// Abstracts away the boilerplate code for the API modules
var APIModule = function (name) {
	this.name = name;
	var usageFilename = name + "_usage.json";
	this.usageLog = new UsageLogger(usageFilename, DEFAULT_WRITE_DELAY);
	this.app = express();
};

module.exports = APIModule;