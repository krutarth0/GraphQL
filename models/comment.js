const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  pid:String,
  by:String,
  message:String,
  datePosted:String,
})

module.exports = mongoose.model('Comment',CommentSchema);
