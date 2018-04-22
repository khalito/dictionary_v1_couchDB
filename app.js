var express = require('express');
var Promise = require('bluebird');
var nano = require('nano')('http://localhost:5984');
var fruits = nano.db.use("fruits");

var app = express();

nano.db.list(function (err, body) {
    // body is an array
//	console.log("datbases: " + body)
});

app.get('/', function (request, response) {
    Promise.promisifyAll(fruits);
    fruits.listAsync().then(function (body) {
        var promisses = [];
        body.rows.forEach(function (doc) {
            promisses.push(
                fruits.getAsync(doc.id));
        });

        // This will make sure every promisses have been done before calling then
        Promise.all(promisses).then(function (data) {
            var listOfFruits = [];
            console.log(data);
            data.forEach(function (item) {
                if (item.name) {
                    listOfFruits.push(item.name);
                    console.log(item.name);
                };
            })
            response.send(listOfFruits);
        });
    }).catch(function(err){

    });
});


var server = app.listen(3000, function () {
    console.log("Running on port 3000")
});