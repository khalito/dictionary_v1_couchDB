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
            data.forEach(function (item) {
                if (item.name) {
                    listOfFruits.push(item.name + " (" + item.colour + ") ");
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
    <label for="nameSearch">Search a color by the name of a fruit</label>
    <form action="http://localhost:3000/search/name/result">
        <input type="text" name="name" id="nameSearch">
        <input type="submit">
    </form>
    <label for="colorSearch">Search a name by the color of a fruit</label>
    <form action="http://localhost:3000/search/color/result">
        <input type="text" name="color" id="colorSearch">
        <input type="submit">
    </form>
    <p><a href="http://localhost:3000/all">See all fruits</a></p>
    `
    response.send(index);
})

app.get('/search/name/result', function (request, response) {    
    let search = '<p>You searched for: </p>' + request.query["name"] + '<br>';
    let result = '<p>The result is: </p>';
    let back = '<p><a href="http://localhost:3000/search">Back to search</a></p>';
    let sorry = '<p>Sorry, this term is not in the database !</p>';
    let query = request.query['name'];

    Promise.promisifyAll(fruits);
    fruits.viewAsync('test', 'color', {'key' : query}).then(function(doc) {
        response.send(search + result + doc.rows[0]['value'] + back);
    }).catch(TypeError, function(err) {
        response.send(search + result + sorry + back);
        console.log("Type not found");
    }).catch(function(err){
        response.send(search + result + sorry + back);
        console.log(err);
    });
})

app.get('/search/color/result', function (request, response) {    
    let search = '<p>You searched for: </p>' + request.query["color"] + '<br>';
    let result = '<p>The result is: </p>';
    let back = '<p><a href="http://localhost:3000/search">Back to search</a></p>';
    let sorry = '<p>Sorry, this term is not in the database !</p>';
    let query = request.query['color'];

    Promise.promisifyAll(fruits);
    fruits.viewAsync('test', 'name', {'key' : query}).then(function(doc) {
        response.send(search + result + doc.rows[0]['value'] + back);
    }).catch(TypeError, function(err) {
        response.send(search + result + sorry + back);
        console.log("Type not found");
    }).catch(function(err){
        response.send(search + result + sorry + back);
        console.log(err);
    });
})


var server = app.listen(3000, function () {
    console.log("Running on port 3000")
});