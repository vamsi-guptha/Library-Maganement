const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  book_id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  author: { type: String, required: true },
  availability_status: { 
    type: String, 
    enum: ['Available', 'Issued'], 
    default: 'Available' 
  },
  shelf_location: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
