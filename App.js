
const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// allow cross-origin requests
app.use(cors());
// connect to mlab database
// make sure to replace  db string with creds
mongoose.connect('mongodb+srv://react:react123@cluster0-qlwi9.mongodb.net/test?retryWrites=true',{  useNewUrlParser: 'true'})
mongoose.connection.once('open', () => {
    console.log('conneted to database');
});

// bind express with graphql
app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000, () => {
    console.log('now listening for requests on port 4000');
});
