var express = require('express');
var Promise = require('bluebird');
var nano = require('nano')('http://localhost:5984');
var fruits = nano.db.use("fruits");

var app = express();

nano.db.list(function (err, body) {
    // body is an array
//	console.log("datbases: " + body)
});

app.get('/all', function (request, response) {
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
            response.send(listOfFruits + '<p><a href="http://localhost:3000/search">Back to search</a></p>');
        });
    }).catch(function(err){

    });
});



app.get('/search', function (request, response) {
    var index = `
    <form action="http://localhost:3000/search/result">
        <input type="text" name="q" autofocus>
        <input type="submit">
    </form>
    <p><a href="http://localhost:3000/all">See all fruits</a></p>
    `
    response.send(index);
})

app.get('/search/result', function (request, response) {    
    //response.send('<p>You searched for: </p>' + request.query["q"]);
    Promise.promisifyAll(fruits);

    let query = request.query['q'];
    
    fruits.getAsync(query).then(function(doc) {

        response.send(doc.colour + '<p><a href="http://localhost:3000/search">Back to search</a></p>');
    
    }).catch(function(err) {
        response.send('<p>Sorry, could not find anything.</p><p><a href="http://localhost:3000/search">Back to search</a></p>');
        console.log(err);
    });
})


var server = app.listen(3000, function () {
    console.log("Running on port 3000")
});