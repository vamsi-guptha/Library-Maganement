const express = require('express');
const { getSeats, createSeat, updateSeat, deleteSeat } = require('../controllers/seatController');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/')
  .get(protect, getSeats)
  .post(protect, admin, createSeat);

router.route('/:id')
  .put(protect, admin, updateSeat)
  .delete(protect, admin, deleteSeat);

module.exports = router;
