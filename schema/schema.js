const graphql = require('graphql');
const graphqlDate = require('graphql-iso-date')
const axios = require('axios');
const parseString = require('xml2js').parseString;
const Post = require('../models/Posts')
const Comment = require('../models/comment')

const {  GraphQLDateTime} = graphqlDate;

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLSchema,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLFloat,
    GraphQLNonNull
} = graphql;


const transformBooks = (items) => items.map(items=>(
  {
    id : items.id,
    title : items.volumeInfo.title,
    subtitle:items.volumeInfo.subtitle,
    genre : items.volumeInfo.categories,
    author : items.volumeInfo.authors,
    language:items.volumeInfo.language,
    pageCount:items.volumeInfo.pageCount,
    textSnippet: items.searchInfo!==undefined ? (items.searchInfo.textSnippet).toString() : " null ",
    description: items.volumeInfo.description,
    maturityRating:items.volumeInfo.maturityRating,
})
);

const transformBook = (items) =>
  ({
      id : items.id,
      title : items.volumeInfo.title,
      subtitle:items.volumeInfo.subtitle,
      genre : items.volumeInfo.categories,
      author : items.volumeInfo.authors,
      language:items.volumeInfo.language,
      pageCount:items.volumeInfo.pageCount,
      textSnippet: items.searchInfo!==undefined ? (items.searchInfo.textSnippet).toString() : " null ",
      description: items.volumeInfo.description,
      maturityRating:items.volumeInfo.maturityRating,


});


const transformAuthor = (items) =>
   ({
       name : items[0].volumeInfo.authors[0],
       genre: [...new Set( items.map(items=> items.volumeInfo.categories!==undefined ? (items.volumeInfo.categories).toString() : " ") )]
 })

 const transformPosts = (result) =>result.map(result=>

    ({
      id :result._id,
      title:result.title,
      by:result.by,
      content:result.content,
      datePosted:result.datePosted,
      suggestions:result.suggestions,
  })
)

const PostsType = new GraphQLObjectType({
  name:'Post',
  fields:()=>({
    id:{ type: GraphQLString },
    title:{ type: GraphQLString },
    by:{ type: GraphQLString },
    content:{ type: GraphQLString },
    datePosted:{ type:  GraphQLDateTime },
    suggestions:{type:GraphQLInt},
    searchTokens:{type:new GraphQLList(GraphQLString)},
    comments:{
      type:new GraphQLList(CommentsType),
      resolve(parent, args){
            return Comment.find({pid:parent.id});
        }
    }
  })

});

const CommentsType = new GraphQLObjectType({
  name:'Comment',
  fields:()=>({
    pid:{ type: GraphQLString },
    by:{ type: GraphQLString },
    message:{ type: GraphQLString },
    datePosted:{ type:  GraphQLDateTime }
  })
});

const BookType = new GraphQLObjectType({

    name: 'Book',
    fields: ( ) => ({
        id: { type: GraphQLID },
        title: { type: GraphQLString },
        subtitle:{ type: GraphQLString },
        genre:  {type : new GraphQLList(GraphQLString)},
        author: {type : new GraphQLList(GraphQLString)},
        language:{ type: GraphQLString },
        pageCount:{type:GraphQLInt},
        textSnippet:{ type: GraphQLString },
        description:{type : GraphQLString },
        maturityRating:{type : GraphQLString }

    })
});

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    fields: ( ) => ({
        name: { type: GraphQLString },
        genre:{type : new GraphQLList(GraphQLString)},
        books: {
          type: new GraphQLList(BookType),
          resolve(parent,args){
            return (
            axios.get(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${parent.name}`)
            .then(res=>transformBooks(res.data.items))
                    )
                  }
              },
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
                  axios.get(`https://www.googleapis.com/books/v1/volumes?q=intitle:${args.search}&maxResults=${args.howmany}&printType=books&orderBy=relevance`)
                  // .then(res=>console.log(res.data.items.map(items=>items.volumeInfo)))
                  .then(res =>transformBooks(res.data.items))
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
            .then(res =>transformBook(res.data))
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
          axios.get(`https://www.googleapis.com/books/v1/volumes?q=inauthor:${args.name}`)
          .then(res =>transformAuthor(res.data.items))
        )
      }
    },

    posts:{
      type:new GraphQLList(PostsType),
      resolve(parent, args){
            return Post.find({});
        }
    },
    comments:{
      type:new GraphQLList(CommentsType),
      resolve(parent, args){
            return Comment.find({});
        }
    }
  }

});

const Mutation = new GraphQLObjectType({
      name:"Mutation",
      fields:{
        addPost:{
          type:PostsType,
          args:{
            title:{ type: GraphQLString },
            by:{ type: GraphQLString },
            content:{ type: GraphQLString },
            suggestions:{type:GraphQLInt},
            searchTokens:{type : new GraphQLList(GraphQLString)}
            },
          resolve(parent,args){
            var post = Post({

              title:args.title,
              by:args.by,
              content:args.content,
              datePosted:args.datePosted,
              suggestions:args.suggestions,
              searchTokens:args.searchTokens
            });
            return post.save();

          }
        },

        addComment:{
          type:CommentsType,
          args:{
            pid:{ type: GraphQLString },
            by:{ type: GraphQLString },
            message:{ type: GraphQLString }
          },
          resolve(parent,args){
            let comment = new Comment({
              pid:args.pid,
              by:args.by,
              message:args.message
            });
            return comment.save()
          }
        }
      }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation:Mutation
});
