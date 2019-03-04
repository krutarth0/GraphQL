const graphql = require('graphql');
const axios = require('axios');
const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull
} = graphql;


const transformResponse = (items) => items.map(items=>(
  {
      id : items.id,
      name : items.volumeInfo.title,
      genre : items.volumeInfo.categories,
      author : items.volumeInfo.authors
})
);

const BookType = new GraphQLObjectType({

    name: 'Book',
    fields: ( ) => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre:  {type : new GraphQLList(GraphQLString)},
        author: {type : new GraphQLList(GraphQLString)}
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        books: {
            type: new GraphQLList(BookType),
            args:{
                  search: {type:GraphQLString},
                  howmany: {type:GraphQLInt},
                },
            resolve(parent, args){
                return (
                  axios.get(`https://www.googleapis.com/books/v1/volumes?q=${args.search}&maxResults=${args.howmany}`)
                  // .then(res=>console.log(res.data.items.map(items=>items.volumeInfo)))
                  .then(res =>transformResponse(res.data.items))

                )
            }
        }
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery
});
