const Book = require('../models/Book');
const Notification = require('../models/Notification');

const getBooks = async (req, res) => {
  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { author: { $regex: req.query.keyword, $options: 'i' } },
          { book_id: { $regex: req.query.keyword, $options: 'i' } }
        ],
      }
    : {};
  const books = await Book.find({ ...keyword });
  res.json(books);
};

const getBookById = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) res.json(book);
  else res.status(404).json({ message: 'Book not found' });
};

const createBook = async (req, res) => {
  try {
    const { book_id, title, author, availability_status, shelf_location } = req.body;
    
    const exists = await Book.findOne({ book_id });
    if (exists) {
      return res.status(400).json({ message: 'Book ID already exists. Please choose a unique ID.' });
    }

    const book = new Book({ book_id, title, author, availability_status, shelf_location });
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { book_id, title, author, availability_status, shelf_location } = req.body;
    const book = await Book.findById(req.params.id);

    if (book) {
      if (book_id && book_id !== book.book_id) {
        const idExists = await Book.findOne({ book_id });
        if (idExists) return res.status(400).json({ message: 'Target Book ID already actively exists.' });
      }

      // Detect status change for notifications
      const isStatusBecomingAvailable = book.availability_status === 'Issued' && availability_status === 'Available';

      book.book_id = book_id || book.book_id;
      book.title = title || book.title;
      book.author = author || book.author;
      book.availability_status = availability_status || book.availability_status;
      book.shelf_location = shelf_location || book.shelf_location;
      
      const updatedBook = await book.save();

      // Trigger Notifications
      if (isStatusBecomingAvailable) {
        await Notification.updateMany(
          { book: book._id, status: 'Pending' },
          { $set: { status: 'Sent' } }
        );
      }

      res.json(updatedBook);
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (book) {
    await book.deleteOne();
    res.json({ message: 'Book removed' });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
