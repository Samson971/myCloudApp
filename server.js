const express = require('express');
var mongodb = require('mongodb');
var swig = require('swig');
var mongoClient = mongodb.MongoClient;

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';
const DATABASE = 'imdb';
const COLLECTION = 'imdb_denormalized';

//uri of the mongo server or router
//for sharded cluster 
//var remote_uri = 'mongodb://administrateur:V8eOFR%_@devincimdb1011.westeurope.cloudapp.azure.com:30000'

var uri = "mongodb://localhost:27017";

// App
const app = express();
swig = new swig.Swig();
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
//app.use(express.static(path.join(__dirname, 'bootstrap')));


app.use(express.static('public'))

//some useful function



/**
 * Routes
 */
app.get('/', (req, res) => {
    return res.render('home');
});

app.get('/request1', (req, res) => {
    var fieldsToRender = ['_id', 'nb'];
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            const db = client.db(DATABASE);
            const collection = db.collection(COLLECTION);

            //exec 
            const opSort = { $sort: { "Rank": -1 } };
            const opLimit = { $limit: 2000 };
            const opMatch = { $match: { "Genres": { $ne: "Unknown" } } };
            const opUnwind = { $unwind: "$Genres" };
            const oGroup = { $group: { _id: "$Genres", "nb": { $sum: 1 } } };
            const opSort2 = { $sort: { "nb": -1 } };
            collection.aggregate([opUnwind, opMatch, opSort, opLimit, oGroup, opSort2])
                .toArray((error, docs) => {
                    if (error) {
                        return res.send(error);
                    }
                    return res.render('basic-table',
                        { elements: docs, fields: fieldsToRender });
                });
            client.close();
        });
})


app.get('/request2', (req, res) => {
    var fieldsToRender = ['Name', 'Rank']
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            const db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            collection.find({ "Directors.Lastname": "Lucas", "Rank": { "$gt": 0.0 } })
                .sort({ "Rank": -1 })
                .toArray((error, docs) => {
                    if (error) {
                        return res.send(error);
                    }
                    return res.render('basic-table',
                        { elements: docs, fields: fieldsToRender });
                });
        });
});

app.get('/test', (req, res) => {
    var fieldsToRender = ['Name', 'Rank', 'Directors.Firstname', 'Directors.Lastname']
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            const db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            //execute request
            collection.find({ "Directors.Firstname": "Sara", "Directors.Lastname": "Botsford" })
                .toArray((error, docs) => {
                    if (error) {
                        return res.send(error);
                    }
                    return res.render('basic-table',
                        {
                            elements: docs,
                            fields: fieldsToRender
                        });
                });
        });
});


app.get('/request-next', (req, res) => {
    var fieldsToRender = ['Name', 'Rank', 'Firstname', 'Lastname']
    mongoClient.connect(uri,
        { useUnifiedTopology: true },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            const db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            //execute request
            const opMatch = { '$match': { "Rank": { '$ne': 0.0, '$lte': 50 } } };
            const opUnwind = { '$unwind': "$Directors" };
            const opGroup = { '$group': { '_id': "$Directors", "avg_notes": { '$avg': "$Rank" }, "nb": { '$sum': 1 } } };
            const opSort = { '$sort': { "avg_notes": -1 } };
            const opLimit = { '$limit': 10 };
            collection.aggregate([opMatch, opUnwind, opGroup, opLimit]).toArray((error, docs) => {
                if (error) {
                    return res.send(error);
                }
                return res.render('basic-table',
                    {
                        elements: docs,
                        fields: fieldsToRender
                    });
            });
        });
});

app.get('/request3', (req, res) => {
    var fieldsToRender = [['_id', 'firstname'], ['_id', 'lastname'], 'nb'];
    mongoClient.connect(uri,
        {
            useUnifiedTopology: true
            //allowDiskUse: true
        },
        (err, client) => {
            if (err) {
                console.error(err);
                res.send(err);
                return;
            }
            const db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            //execute request
            const opUnwind = { $unwind: "$Roles" };
            const opSort = { $sort: { "Rank": -1 } };
            const opLimit = { $limit: 100000 }
            const opGroup = { $group: { _id: { "firstname": "$Roles.Actor.Firstname", "lastname": "$Roles.Actor.Lastname" }, "nb": { $sum: 1 } } };
            const opSort2 = { $sort: { "nb": -1 } };
            collection.aggregate([opUnwind, opSort, opLimit, opGroup, opSort2])
                .toArray((error, docs) => {
                    if (error) {
                        return res.send(error);
                    }
                    return res.render('custom-table1',
                        {
                            elements: docs,
                            fields: fieldsToRender
                        });
                });
        });
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);