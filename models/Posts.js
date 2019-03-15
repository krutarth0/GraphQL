const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const PostSchema = new Schema({

  title:String,
  by:String,
  content:String,
  datePosted:String,
  suggestions:Number

})

module.exports = mongoose.model('Post',PostSchema);
