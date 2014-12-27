var request = require("request");
var assert  = require("assert");

var USERNAME = "sourdesi"; // That's me!

request("http://localhost:3000/hacker_news/user/"+USERNAME, function (err, response, body) {
	assert.ifError(err);
	try {
		var obj = JSON.parse(body);
		assert.notEqual(obj, null, "Received null response");
	} catch(err) {
		assert.ifError(err);
	}
	console.log("Passed Hacker News Get User Info tests");
});