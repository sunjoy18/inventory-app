const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discount: {
        percentage: { type: Number, default: 0 },
        expiresAt: { type: Date }
    }
});

module.exports = mongoose.model('Product', ProductSchema);
