const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  pid:String,
  by:String,
  message:String,
  datePosted:{ type: Date, default: Date.now },
});

module.exports = mongoose.model('Comment',commentSchema);
