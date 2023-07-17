const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const planSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    price: { type: Number, required: true },
    validity: { type: Number, required: true },
    maxConnections: { type: Number, required: true },
},{timestamps:true});

module.exports = mongoose.model('Plan', planSchema);
