const express = require('express');
var mongodb = require('mongodb');
var swig = require('swig');
var mongoClient = mongodb.MongoClient;
const mustacheExpress = require('mustache-express');

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const DATABASE = 'imdb';
const COLLECTION = 'imdb_denormalized';

//uri of the mongo server or router
var uri = "mongodb://localhost:27017";

// App
const app = express();
//app.engine('mustache', mustacheExpress());
//app.set('view engine', 'mustache');
//app.set('view engine', 'twig');
var swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
//app.use(express.static(path.join(__dirname, 'bootstrap')));


//some useful function



/**
 * Routes
 */
app.get('/', (req, res) => {
    res.send('Hello world');
});

app.get('/test', (req, res) => {
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            db = client.db(DATABASE);
            const collection = db.collection(COLLECTION);
            collection.countDocuments((error, count) => {
                if (error) {
                    console.error(err);
                    res.send(err);
                    return;
                }
                res.send(count.toString() + '\n');
            });
            client.close();
        });
})


app.get('/get', (req, res) => {
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            collection.find({ "Directors.Lastname": "Lucas", "Rank": { "$gt": 0.0 } }).project({ "Name": 1, "Rank": 1 }).toArray((error, docs) => {
                if (error) {
                    return res.send(error);
                }
                return res.render('basic-table',
                    { elements: docs });
            });
        });
});

app.get('/request/:requestID', (req, res) => {
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            //execute request
            opMatch = {$match:{"Rank":{$ne:0.0,$lte:50}}};
            opUnwind = {$unwind:"$Directors"};
            opGroup = {$group:{_id:"$Directors","avg_notes":{$avg:"$Rank"},"nb":{$sum:1}}};
            opSort = {$sort:{"avg_notes":-1}};
            opLimit = { $limit: 1 };
            collection.aggregate([opMatch, opUnwind, opGroup, opSort, opLimit]).toArray((error, docs) => {
                if (error) {
                    return res.send(error);
                }
                return res.render('basic-table',
                    { elements: docs });
            });
        });
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);