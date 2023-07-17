const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const videoSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: [{type: Schema.Types.ObjectId, ref: 'Plan'}]
},{timestamps:true});

module.exports = mongoose.model('Video', videoSchema);
