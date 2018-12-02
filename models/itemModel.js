var mongoose = require('mongoose');

var ItemSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    Name: { type: String, require: true },
    Room: { type: String, require: true }, 
    Price: { type: Number, require: true },
    ModelNum: {type: String, require: true },
    SerialNum: String,
    Purchase_Location: { type: String, require: true},
    Receipt_URL: String,
    Product_URL: String,
    UserID: mongoose.Schema.Types.ObjectId
});

module.exports = mongoose.model('Item', ItemSchema, 'Inventory');