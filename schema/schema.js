const graphql = require('graphql');
const axios = require('axios');
const parseString = require('xml2js').parseString;

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
      author : items.volumeInfo.authors,
      description: items.volumeInfo.description
})
);

const transformResponseID = (items) =>
  ({
      id : items.id,
      name : items.volumeInfo.title,
      genre : items.volumeInfo.categories,
      author : items.volumeInfo.authors,
      description: items.volumeInfo.description

});

const transformXml = (result) =>({
      id : result.GoodreadsResponse.author[0].$.id,
      name : result.GoodreadsResponse.author[0].name
});

const transformXmlB = (book) => book.map(book=>//console.log(book);
      ({
           id : book.id[0]._,
           name : book.title[0],
           genre : ["NO GENRE"],
           author : book.authors[0].author[0].name,
           description: book.description[0]
  })
);
const BookType = new GraphQLObjectType({

    name: 'Book',
    fields: ( ) => ({
        id: { type: GraphQLID },
        name: { type: GraphQLString },
        genre:  {type : new GraphQLList(GraphQLString)},
        author: {type : new GraphQLList(GraphQLString)},
        description:{type : GraphQLString }
    })
});

const AuthorType = new GraphQLObjectType({

    name: 'Author',
    fields: ( ) => ({
        id: { type: GraphQLID },
        name: {type : new GraphQLList(GraphQLString)},
        books: {
          type: new GraphQLList(BookType),
          resolve(parent,args){
            return (
            axios.get(`https://www.goodreads.com/author/list/${parent.id}?format=xml&key=MxWOOlQcCaNvPUaOHiNp3g`)
            .then(res =>{
                let respB
                parseString(res.data, function (err, result) {
                  respB=result
                  })
                return transformXmlB(respB.GoodreadsResponse.author[0].books[0].book);//respB.GoodreadsResponse.author[0].books[0].book[0].id[0]._
            })
          )
        }
        }
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
        },

        book:{
          type:BookType,
          args:{
            id:{type:GraphQLID}
          },
          resolve(parent,args){
            return(
            axios.get(`https://www.googleapis.com/books/v1/volumes/${args.id}`)
            .then(res =>transformResponseID(res.data))
          )
        }
      },

      author:{
        type:AuthorType,
        args:{
          name:{type:GraphQLString}
        },
        resolve(parent,args){
          return(
          axios.get(`https://www.goodreads.com/api/author_url/${args.name}?key=MxWOOlQcCaNvPUaOHiNp3g`)
          .then(res =>{
              let resp
              parseString(res.data, function (err, result) {
                resp=result
                })
              return transformXml(resp);
          })
        )
      }
    }
    }
});


module.exports = new GraphQLSchema({
    query: RootQuery
});
