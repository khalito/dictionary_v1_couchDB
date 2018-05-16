const express = require('express');
const Promise = require('bluebird');
const nano = require('nano')('http://localhost:5984');
const dict = nano.db.use("dict");
const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// List all words we have
app.get('/all', function (request, response) {
    Promise.promisifyAll(dict);

    // Get a list of everything! Replace later with a view !
    // See if we can use Arabic letters !!
    dict.listAsync({include_docs : true}).then(function(doc) {
        let words = [];
        doc.rows.forEach(function(row) {
            let word = row.doc['word'];
            if(word) {
                words.push(word)
            }
        })
        response.render('allWords', {
            'words' : words
        })
    })
})

// The search page
// Add a drop down, populated by a view of all the words to make testing easier
app.get('/search', function (request, response) {
    response.render('index');
})

// Replace the name page with a noun-specific page
app.get('/search/name/result', function (request, response) {    
    let search = '<p>You searched for: </p>' + request.query["name"] + '<br>';
    let result = '<p>The result is: </p>';
    let back = '<p><a href="http://localhost:3000/search">Back to search</a></p>';
    let sorry = '<p>Sorry, this term is not in the database !</p>';
    let query = request.query['name'];

    Promise.promisifyAll(dict);
    dict.viewAsync('test', 'color', {'key' : query}).then(function(doc) {
        response.send(search + result + doc.rows[0]['value'] + back);
    }).catch(TypeError, function(err) {
        response.send(search + result + sorry + back);
        console.log("Type not found");
    }).catch(function(err){
        response.send(search + result + sorry + back);
        console.log(err);
    });
})

// Replace the color page with a verb-specific page
app.get('/search/color/resultEJS', function(request, response) {
    let query = request.query['color'];
    Promise.promisifyAll(dict);
    
    dict.viewAsync('test', 'name', {'key' : query}).then(function(doc){
        response.render('result', {
            'color' : doc.rows[0]['value']
        });
    })
})

// To be delted once the verb page is there.
app.get('/search/color/result', function (request, response) {    
    let search = '<p>You searched for: </p>' + request.query["color"] + '<br>';
    let result = '<p>The result is: </p>';
    let back = '<p><a href="http://localhost:3000/search">Back to search</a></p>';
    let sorry = '<p>Sorry, this term is not in the database !</p>';
    let query = request.query['color'];

    Promise.promisifyAll(dict);
    dict.viewAsync('test', 'name', {'key' : query}).then(function(doc) {
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