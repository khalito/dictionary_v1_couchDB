var express = require('express');
var nano = require('nano')('http://localhost:5984');
var fruits = nano.db.use("fruits");

var app = express();

nano.db.list(function(err, body) {
  	// body is an array
//	console.log("datbases: " + body)
});


app.get('/', function(request, response) {
	var listOfFruits = ["test", "another"];
	fruits.list(function(err, body) {
		if (!err) {
			body.rows.forEach(function(doc) {
				fruits.get(doc.id, function(err, body) {
					if (body.name) {
						console.log(body.name);
						listOfFruits.push(body.name);
						console.log(listOfFruits);
					};
				});
			});
		};
	});
	response.send(listOfFruits);
});


var server = app.listen(3000, function() {
	console.log("Running on port 3000")
});