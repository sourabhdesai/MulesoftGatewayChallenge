var request = require("request");
var assert  = require("assert");

request.post({
	"headers": {'content-type' : 'application/json'},
	"url":"http://localhost:3000/nlptools/sentiment/single",
	"body": JSON.stringify({"txt":"Clap along if you feel like a room without a roof"}) // Positive sentiment ... Checked beforehand
}, function (err, response, body) {
	assert.ifError(err);
	try {
		var obj = JSON.parse(body);
		assert.equal("error" in obj, false, "Received error response");
		assert.equal(obj.result.sentiment, "Positive", "Lyrics for 'Happy' didn't get positive sentiment analysis");
	} catch(err) {
		assert.ifError(err);
	}
	console.log("Passed NLP Tools Single Sentiment Analysis tests");
});

var songLyrics = [
	"Clap along if you feel like a room without a roof", // Positive
	"Coming out of the woodwork, Chest bursts like John Hurt" // Negative ... Any fans of Alt-J at Mulesoft?
];

request.post({
	"headers": {'content-type' : 'application/json'},
	"url":"http://localhost:3000/nlptools/sentiment/batch",
	"body": JSON.stringify(songLyrics)
}, function (err, response, body) {
	assert.ifError(err);
	try {
		var sentiments = JSON.parse(body);
		assert.equal("error" in sentiments, false, "Received error response");
		assert.equal(sentiments.length, songLyrics.length, "Didn't receive correct number of sentiments");
		assert.equal(sentiments[0].result, "Positive", "Lyrics for 'Happy' didn't get positive sentiment in batch analysis");
		assert.equal(sentiments[1].result, "Negative", "Lyrics for 'The Gospel of John Hurt' didn't get negative sentiment in batch analysis");
	} catch(err) {
		assert.ifError(err);
	}
	console.log("Passed NLP Tools Batch Sentiment Analysis tests");
});