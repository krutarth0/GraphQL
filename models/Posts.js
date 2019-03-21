const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const postSchema = new Schema({

  title:String,
  by:String,
  content:String,
  datePosted:{ type: Date, default: Date.now },
  suggestions:Number,
  searchTokens:[String]
});

module.exports = mongoose.model('Post',postSchema);
