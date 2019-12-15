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

app.get('/test', (req, res) => {
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
    var fieldsToRender = ['Name','Rank']
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
            .sort({"Rank":-1})
            .toArray((error, docs) => {
                if (error) {
                    return res.send(error);
                }
                return res.render('basic-table',
                    { elements: docs, fields: fieldsToRender });
            });
        });
});

app.get('/request/1', (req, res) => {
    var fieldsToRender = ['Name','Rank','Directors.Firstname','Directors.Lastname']
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
            collection.find({"Directors.Firstname":"Sara","Directors.Lastname":"Botsford"})
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


app.get('/request/2', (req, res) => {
    var fieldsToRender = ['Name','Rank','Firstname','Lastname']
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
            const opMatch = {'$match':{"Rank":{'$ne':0.0,'$lte':50}}};
            const opUnwind = {'$unwind':"$Directors"};
            const opGroup ={'$group':{'_id':"$Directors","avg_notes":{'$avg':"$Rank"},"nb":{'$sum':1}}};
            const opSort = {'$sort':{"avg_notes":-1}};
            const opLimit = { '$limit': 10 };
            collection.aggregate([opMatch, opUnwind, opGroup,opLimit]).toArray((error, docs) => {
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

app.get('/request/3', (req, res) => {
    var fieldsToRender = ['Name','Rank','Directors.Firstname','Directors.Lastname']
    var genre = 'Action';
    var proba = 90;
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
            const opUnwind = {'$unwind':"$Directors"};
            const opMatch = {'$match':{}}
            collection.find({"Directors.Firstname":"Sara","Directors.Lastname":"Botsford"})
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


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);