const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  floor: { type: Number, required: true },
  section: { type: String, required: true },
  gridRow: { type: Number, required: true },
  gridCol: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['Available', 'Occupied', 'Reserved'], 
    default: 'Available' 
  }
}, { timestamps: true });

// Ensure we don't have duplicate seats in the exact same physical spot
seatSchema.index({ floor: 1, section: 1, gridRow: 1, gridCol: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
