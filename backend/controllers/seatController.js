const Seat = require('../models/Seat');

const getSeats = async (req, res) => {
  const seats = await Seat.find({});
  res.json(seats);
};

const createSeat = async (req, res) => {
  try {
    const { floor, section, gridRow, gridCol, status } = req.body;
    const seat = new Seat({ floor, section, gridRow, gridCol, status });
    const createdSeat = await seat.save();
    res.status(201).json(createdSeat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSeat = async (req, res) => {
  const { status } = req.body;
  const seat = await Seat.findById(req.params.id);

  if (seat) {
    seat.status = status || seat.status;
    const updatedSeat = await seat.save();
    res.json(updatedSeat);
  } else {
    res.status(404).json({ message: 'Seat not found' });
  }
};

const deleteSeat = async (req, res) => {
  const seat = await Seat.findById(req.params.id);
  if (seat) {
    await seat.deleteOne();
    res.json({ message: 'Seat removed' });
  } else {
    res.status(404).json({ message: 'Seat not found' });
  }
};

module.exports = { getSeats, createSeat, updateSeat, deleteSeat };
