var colors = require("colors");
var request = require("request");
var spawn = require('child_process').spawn;
var readline = require('readline');

var NUM_ARTICLES = 15;

colors.setTheme({
	positive: "green",
	negative: "red",
	neutral: "white",
	article: "inverse",
	error: "bold",
	progress: "yellow",
	question: "cyan"
});

app();

var commands = ["list", "open", "help", "exit"];

// REPL state machine
function app() {
	aggregateNewsData(function(err, articles) {
		if (err) {
			console.log(err);
			process.exit();
		}
		listArticles(articles);

		var rl = readline.createInterface({
	  		input: process.stdin,
	  		output: process.stdout
		});

		var currArticle = null;

		rl.on('line', function (line) {
			line = line.trim();
			switch (line) {
				case "list": {
					listArticles(articles);
					currArticle = null;
					break;
				}
				case "open": {
					if (currArticle)
						openArticle(currArticle);
					else
						console.log("Need to be viewing an article first".error);
					break;
				}
				case "help": {
					help();
					break;
				}
				case "exit": {
					rl.close();
					process.exit();
					break;
				}
				default: {
					var openCmd = false;
					var match = line.match(/open [0-9][0-9]*/);
					if (match) {
						if (match[0] != line) {
							console.log("Not a valid command".error);
							return;
						}
						line = match[0].substring(4).trim();
						openCmd = true;
					}
					match = line.match(/[0-9][0-9]*/);
					if (match && match[0] == line) {
						var index = parseInt(line) - 1;
						if (index < 0 || index >= articles.length) {
							console.log("Invalid Article Number".error);
							return;
						}
						currArticle = articles[index];
						if (openCmd)
							openArticle(currArticle);
						else
							showArticle(currArticle);
					} else
						console.log("Not a valid command".error);
				}
			}
		});
	}, showProgressUpdate);
}

function listArticles(articles) {
	clearConsole();
	for(var i=0; i < articles.length; i++) {
		var article = articles[i];
		var title = article.title;
		var rank = i+1;
		if (article.sentiment == "Positive")
			console.log(rank + ".\t" + title.positive);
		else if (article.sentiment == "Negative")
			console.log(rank + ".\t" + title.negative);
		else
			console.log(rank + ".\t" + title.neutral);
	}
}

function showArticle(article) {
	clearConsole();
	console.log("Title:".article, article.title);
	console.log("Link:".article, article.url, "(type 'open' to open in browser)");
	console.log("Summary:".article);
	console.log(article.summary);
} 

function help() {
	clearConsole();
	console.log("Available Commands");
	commands.forEach(function (cmd) {
		console.log("\t" + cmd);
	});
	console.log("\tCan also type in an article's number to view its summary");
}

function clearConsole() {
	// May not be OS agnostic implementation:
	//    Source: http://stackoverflow.com/questions/9006988/node-js-on-windows-how-to-clear-console
	process.stdout.write('\033c');
}

function openArticle(article) {
	spawn("open", [article.url]);
}

/*
Collects maximum of {NUM_ARTICLES} top Hacker News articles and generates their summaries and sentiments
Params -
	cb - callback funciton with 1st param holding error response, 2nd param holding result
	onProgress - callback function to handle showing of data collection progress. Takes in string as param
Get ready for some callback hell
*/
function aggregateNewsData(cb, onProgress) {
	onProgress("Getting Stories from Hacker News");
	getTopNews(function(err, idArray) {
		if (err) {
			console.log(err);
		} else {
			var numArticles = Math.min(NUM_ARTICLES, idArray.length);
			var articleObjects = {};
			var summaryCount = 0;
			onProgress("Getting article summaries");
			for (var i = 0; i < numArticles; i++)
				getArticle(idArray[i], function(err, info) {
					if (err) {
						console.log(err, null);
					} else {
						articleObjects[info.title] = {
							url: info.url
						};
						getSummary(info.url, function(err, summary) { // May need to add title of article to cb function
							summaryCount++;
							if (err) {
								articleObjects[info.title].summary = "Couldn't generate summary for article";
							} else {
								articleObjects[info.title].summary = summary;
							}
							if (summaryCount == numArticles) { // Collected summaries for all articles
								onProgress("Analyzing article sentiments");
								var summaries = new Array(numArticles);
								var j = 0;
								for (var articleTitle in articleObjects)
									summaries[j++] = articleObjects[articleTitle].summary;
								getSentiments(summaries, function(err, sentiments) {
									if (err) {
										console.log(err);
									} else {
										onProgress("Found sentiments!");
										var k = 0;
										for (var articleTitle in articleObjects)
											articleObjects[articleTitle].sentiment = sentiments[k++].result;
										var articleArray = convertObjToArray(articleObjects);
										cb(null, articleArray);
									}
								});
							}
						});
					}
				});
		}
	});
}

function convertObjToArray(obj) {
	var array = [];
	for(var key in obj) {
		var value = obj[key];
		value.title = key;
		array.push(value);
	}
	return array;
}

// callback function for aggregateNewsData for showing progress updates
function showProgressUpdate(progressHint) {
	console.log(progressHint.progress);
}

/*
Gets top news currently on Hacker News
Takes cb function with (err,result) params
	result - array of item IDs from HN API.
*/
function getTopNews(cb) {
	request("http://localhost:3000/hacker_news/top", function (err, response, body) {
		if (err)
			cb(err, null);
		else {
			var jsonBody = JSON.parse(body);
			cb(err, jsonBody);
		}
	});
}

/*
Gets info about a particular article given by its itemID
Take cb function with (err,result) params
	result - JSON object containing article info. Example at https://hacker-news.firebaseio.com/v0/item/8777720.json
*/
function getArticle(itemID, cb) {
	request("http://localhost:3000/hacker_news/item/" + itemID, function (err, response, body) {
		if (err)
			cb("Couldn't fetch article requested".error, null);
		else {
			var articleInfo = JSON.parse(body);
			cb(null, articleInfo);
		}
	});
}

/*
Gets a summary of the article at a given URL
Takes a url and a cb function
	url - link to article that you want to generate summary for
	cb - callback function with params (err, result)
		result - object containt title (of article), summary (array of sentences summarizing the article), and source (domain of site the article is from)
*/
function getSummary(url, cb) {
	request("http://localhost:3000/nlptools/summarize?url=" + url, function(err, httpResponse, body) {
		if (err)
			cb("Couldn't fetch summary".error, null);
		else {
			if (body[0] != '{') {
				cb("Summarizer failed to create summary".error, null);
				return;
			}
			var jsonBody = JSON.parse(body);
			if ("summary" in jsonBody) {
				var summaryArray = jsonBody.summary;
				if (summaryArray.length == 0)
					cb("Summarizer failed to create summary".error, null);
				else {
					var summaryText = "";
					for (var i = 0; i < summaryArray.length-1; i++)
						summaryText += summaryArray[i] + " ";
					summaryText += summaryArray[summaryArray.length-1];
					cb(null, summaryText);
				}
			} else {
				cb("Summarizer failed to create summary".error, null);
			}
		}
	});
}

/*
Given an array of paragraphs (article summaries), provides sentiment analysis for each.
Takes texts and a cb function
	texts - array of strings
	cb - callback function of form (err,result)
		result - array of objects. Each object results contains sentiment of paragraph at corresponding index in texts. Sentiment object contains sentiment value and confidence value
*/
function getSentiments(texts, cb) {
	request.post({
		"headers": {'content-type' : 'application/json'}, // Must specify proper MIME type for this to work
		"url": "http://localhost:3000/nlptools/sentiment/batch",
		"body": JSON.stringify(texts)
	}, function(err, httpResponse, body) {
		if (err) {
			cb("Error retrieving sentiments".error, null);
			console.log(err);
		} else {
			var sentiments = JSON.parse(body);
			if ("error" in sentiments)
				cb("Error retrieving sentiments".error, null);
			else
				cb(null, sentiments);
		}
	});
}