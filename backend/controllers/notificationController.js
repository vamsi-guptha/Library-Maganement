const store = require('../data/store');

const createNotification = async (req, res) => {
  try {
    const { bookId } = req.body;
    
    // Check for duplicate pending requests
    const existing = store.findOne('notifications', {
      user: String(req.user._id),
      book: bookId,
      status: 'Pending'
    });

    if (existing) {
      return res.status(400).json({ message: 'You have already requested a notification for this book.' });
    }

    const createdNotification = store.create('notifications', {
      user: String(req.user._id),
      book: bookId,
      status: 'Pending'
    });
    
    res.status(201).json(createdNotification);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const notifications = store.find('notifications', { user: String(req.user._id) });
    
    // Manually populate 'book'
    const populated = notifications.map(notif => {
      const bookData = store.findById('books', notif.book);
      return {
        ...notif,
        book: bookData ? { _id: bookData._id, title: bookData.title, author: bookData.author, book_id: bookData.book_id } : null
      };
    });

    res.json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const dismissNotification = async (req, res) => {
  try {
    const notification = store.findById('notifications', req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Ensure the user owns this notification
    if (notification.user !== String(req.user._id)) {
      return res.status(401).json({ message: 'Not authorized to dismiss this notification' });
    }

    store.deleteById('notifications', req.params.id);
    res.json({ message: 'Notification dismissed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { createNotification, getNotifications, dismissNotification };
