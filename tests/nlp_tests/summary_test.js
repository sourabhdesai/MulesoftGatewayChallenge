var request = require("request");
var assert  = require("assert");

request("http://localhost:3000/nlptools/summarize?url=https://www.joyent.com/developers/node/design", function (err, response, body) {
	assert.ifError(err);
	try {
		var obj = JSON.parse(body);
		assert.equal("summary" in obj, true, "Response didn't have a summary");
	} catch(err) {
		assert.ifError(err);
	}
	console.log("Passed NLP Tools Summarization tests");
});