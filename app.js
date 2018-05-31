const express = require('express');
const Promise = require('bluebird');
const nano = require('nano')('http://localhost:5984');
const dict = nano.db.use("dict");
const app = express();
const path = require('path');
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


function getAllArabicDocs(request, response) {
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



// TO DO
// - Add get request for a VERB VIEW ! Maybe using a "NEXT" function ? 
// Or better, replace the NOUNS view with a ALL_WORDS view !!
//
// - Try using a word in Arabic letters !
// 
app.get('/search/result', function (request, response) {    
    let query = request.query['searchedWord'];

    Promise.promisifyAll(dict);
    dict.viewAsync('nouns', 'all', {'key' : query, include_docs : true}).then(function(doc) {
        
        let results = [];
        doc.rows.forEach(function(row) {
            let translation = row['value'];
            let category = row['doc']['category'];
            let root = row['doc']['root'];
            let parent = row['doc']['parent'];
            let parentLinkType = row['doc']['parentLinkType'];
            if (category == 'noun') {
                var nounDetails_quantity = row['doc']['nounDetails'][0]['quantity'];
                var nounDetails_gender = row['doc']['nounDetails'][1]['gender'];
            }
            results.push({
                translation : translation,
                category : category,
                root : root,
                parent : parent,
                parentLinkType : parentLinkType,
                nounDetails_quantity : nounDetails_quantity,
                nounDetails_gender : nounDetails_gender,
            });
            console.log('Noun data: \n')
            console.log(doc); console.log('\n');
            console.log(doc.rows); console.log('\n');
            console.log(doc.rows[0]['doc']['nounDetails']);
            console.log('Verb data: \n')
        })


        response.render('result', {
            'searchedWord' : query,
            'results' : results 
        });

    }).catch(TypeError, function(err) {
        console.log("Type not found");
    }).catch(function(err){
        console.log(err);
    });
})


var server = app.listen(3000, function () {
    console.log("Running on port 3000")
});