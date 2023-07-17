const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const purchasePlanSchema = new Schema({
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: Schema.Types.ObjectId, ref: 'Plan', required: true },
  purchaseDate: { type: Number, required: true },
  validity: {type: Number, required: true },
},{timestamps:true});

module.exports = mongoose.model('PurchasePlan', purchasePlanSchema);
