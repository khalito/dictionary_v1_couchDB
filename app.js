const express = require('express');
const Promise = require('bluebird');
const nano = require('nano')('http://localhost:5984');
const dict = nano.db.use("dict");
const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));


function log (text) {
    console.log(text);
}

function getAllArabicDocs (request, response) {
    return new Promise(function (resolve, reject) {
        Promise.promisifyAll(dict);

        dict.listAsync({include_docs : true}).then(function(doc) {
            let words = [];
            doc.rows.forEach(function(row) {
                let word = row.doc['word'];
                if(word) {
                    words.push(word)
                }
            })
            resolve(words);
        })
    })
}


function populateResults (row) {
    let doc = {};
    let id = row['id'];
    let translation = row['doc']['translation'];
    let category = row['doc']['category'];
    let root = row['doc']['root'];
    let parent = row['doc']['parent'];
    let parentLinkType = row['doc']['parentLinkType'];
    let children = row['doc']['children'];
    if (category == 'noun') {
        var nounDetails_quantity = row['doc']['nounDetails'][0]['quantity'];
        var nounDetails_gender = row['doc']['nounDetails'][1]['gender'];
    }
    if (category == 'verb') {
        var verbDetails_form = row['doc']['verbDetails'][0]['form'];
        var verbDetails_person = row['doc']['verbDetails'][1]['person'];
        var verbDetails_numerus = row['doc']['verbDetails'][2]['numerus'];
        var verbDetails_modus = row['doc']['verbDetails'][3]['modus'];
        var verbDetails_genus = row['doc']['verbDetails'][4]['genus'];
        var verbDetails_tempus = row['doc']['verbDetails'][5]['tempus'];
    }
    doc.id = id,
    doc.translation = translation,
    doc.category = category,
    doc.root = root,
    doc.parent = parent,
    doc.parentLinkType = parentLinkType,
    doc.children = children,
    doc.nounDetails_quantity = nounDetails_quantity,
    doc.nounDetails_gender = nounDetails_gender,
    doc.verbDetails_form = verbDetails_form,
    doc.verbDetails_person = verbDetails_person,
    doc.verbDetails_numerus = verbDetails_numerus,
    doc.verbDetails_modus = verbDetails_modus,
    doc.verbDetails_genus = verbDetails_genus,
    doc.verbDetails_tempus = verbDetails_tempus
    //console.log('this is the populateResults function');
    //console.log(doc);
    return doc;
}

// List all words we have
app.get('/all', function (request, response) {
    getAllArabicDocs().then(function(words) {
        response.render('allWords', {
            'words' : words
        })
    })
})

// The search page
app.get('/search', function (request, response) {
    getAllArabicDocs().then(function(words) {
        response.render('search', {
            'words' : words
        })
    })
});

app.get('/search/result', function (request, response) {
    let queryWord = request.query['queryWord'];
    let queryId = request.query['queryId']; // switch to IDs as soon as possible !
    log(queryWord);
    log(queryId);
    Promise.promisifyAll(dict);

    // switch to "by_id" view and queryId as key
    dict.viewAsync('all', 'by_word', {'key' : queryWord, include_docs : true}).then( function (doc) {
        let results = [];
        doc.rows.forEach( function (row) {
            results.push(populateResults (row));
        });
        console.log('this is the results array:')
        console.log(results);
        response.render('result', {
            'queryWord' : queryWord,
            'results' : results
        })
    }).catch(TypeError, function(err) {
        console.log("Type not found");
    }).catch(function(err){
        console.log(err);
    });
})

var server = app.listen(3000, function () {
    console.log("Running on port 3000")
});