const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true,
    minlength: 5,
    maxlength: 50,
  },
  email: { type: String, unique: true, sparse: true},
  phone: { type: String, unique: true, sparse: true},
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
},{timestamps:true});

module.exports = mongoose.model('User', UserSchema);
