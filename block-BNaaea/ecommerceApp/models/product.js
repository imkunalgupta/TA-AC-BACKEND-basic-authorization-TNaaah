var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var productSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: Number,
    price: Number,
    image: { type: String, required: true },
    likes: Number,
    category: { type: [String], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
