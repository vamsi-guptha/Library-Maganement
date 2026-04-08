const store = require('../data/store');

const getSeats = async (req, res) => {
  const seats = store.get('seats');
  res.json(seats);
};

const createSeat = async (req, res) => {
  try {
    const { floor, section, gridRow, gridCol, status } = req.body;
    const createdSeat = store.create('seats', { floor, section, gridRow, gridCol, status });
    res.status(201).json(createdSeat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateSeat = async (req, res) => {
  const { status } = req.body;
  const seat = store.findById('seats', req.params.id);

  if (seat) {
    const updatedSeat = store.updateById('seats', req.params.id, { status: status || seat.status });
    res.json(updatedSeat);
  } else {
    res.status(404).json({ message: 'Seat not found' });
  }
};

const deleteSeat = async (req, res) => {
  const deleted = store.deleteById('seats', req.params.id);
  if (deleted) {
    res.json({ message: 'Seat removed' });
  } else {
    res.status(404).json({ message: 'Seat not found' });
  }
};

module.exports = { getSeats, createSeat, updateSeat, deleteSeat };
