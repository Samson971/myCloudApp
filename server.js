const express = require('express');
var mongodb = require('mongodb');
var mongoClient = mongodb.MongoClient;

// Constants
const PORT = 8080;
const HOST = '0.0.0.0';

//uri of the mongo server or router
var uri = "mongodb://localhost:27017/imdb";

// App
const app = express();
app.get('/', (req, res) => {
    res.send('Hello world\n');
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
            db = client.db('imdb');
            const collection = db.collection('imdb_denormalized');
            collection.countDocuments((error,count)=>{
                if(error)
                {
                    console.error(err);
                    res.send(err);
                    return;
                }
                res.send(count.toString() +'\n');
            });
            client.close();
        });
})

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);