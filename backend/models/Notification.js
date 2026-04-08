const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Sent'], 
    default: 'Pending' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
