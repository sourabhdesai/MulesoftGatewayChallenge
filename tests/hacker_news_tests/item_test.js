var assert  = require("assert");
var request = require("request");

var ARTICLE_ID = "6419067"; // Interesting read :)

request("http://localhost:3000/hacker_news/item/" + ARTICLE_ID, function (err, response, body) {
	assert.ifError(err);
	try {
		var obj = JSON.parse(body);
		assert.notEqual(obj, null, "Received null response");
	} catch(err) {
		assert.ifError(err);
	}
	console.log("Passed Hacker News Get Item tests");
});