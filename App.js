const express = require('express');
const graphqlHTTP = require('express-graphql');
const schema = require('./schema/schema');
const cors = require('cors');
const mongoose = require('mongoose')
const app = express();

// allow cross-origin requests
app.use(cors());

//databse
mongoose.connect('mongodb+srv://PostsClient:BookSTack2019@cluster0-qlwi9.mongodb.net/test?retryWrites=true',{ useNewUrlParser: true})
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
