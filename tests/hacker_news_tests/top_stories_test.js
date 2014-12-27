var assert  = require('assert');
var request = require('request');

request("http://localhost:3000/hacker_news/top", function (err, response, body) {
	assert.ifError(err);
	try {
		var obj = JSON.parse(body);
		assert.notEqual(obj, null, "Received null response");
	} catch(err) {
		assert.ifError(err);
	}
	console.log("Passed Hacker News Get Top Stories tests");
});