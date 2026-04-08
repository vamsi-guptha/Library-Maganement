const Notification = require('../models/Notification');

const createNotification = async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Check for duplicate pending requests
    const existing = await Notification.findOne({
      user: req.user._id,
      book: bookId,
      status: 'Pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already requested a notification for this book.' });
    }

    const notification = new Notification({
      user: req.user._id,
      book: bookId,
      status: 'Pending'
    });
    
    const createdNotification = await notification.save();
    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).populate('book', 'title author book_id');
    res.json(notifications);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const dismissNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the user owns this notification
    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to dismiss this notification' });
    }

    await notification.deleteOne();
    res.json({ message: 'Notification dismissed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createNotification, getNotifications, dismissNotification };
