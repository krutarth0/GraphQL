const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors')

const app = express();

//allow cross-origin request
app.use(cors());

// connect to mlab database
// make sure to replace my db string & creds with your own
mongoose.connect('mongodb://react:react123@cluster0-shard-00-00-qlwi9.mongodb.net:27017,cluster0-shard-00-01-qlwi9.mongodb.net:27017,cluster0-shard-00-02-qlwi9.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true', {useNewUrlParser: true})
mongoose.connection.once('open', () => {
    console.log('conneted to database');
});

// bind express with graphql
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
<<<<<<< HEAD
    console.log('now listening for requests on port 4000 !!');
=======
    console.log('now listening for requests on port 4000 !!!!!!!!');
>>>>>>> 44edfa888378e10bb2fce09ef644ec390a0ed50d
});
