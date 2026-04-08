const store = require('../data/store');

const getBooks = async (req, res) => {
  let books = store.get('books');
  if (req.query.keyword) {
    const kw = req.query.keyword.toLowerCase();
    books = books.filter(b => 
      b.title.toLowerCase().includes(kw) || 
      b.author.toLowerCase().includes(kw) || 
      b.book_id.toLowerCase().includes(kw)
    );
  }
  res.json(books);
};

const getBookById = async (req, res) => {
  const book = store.findById('books', req.params.id);
  if (book) res.json(book);
  else res.status(404).json({ message: 'Book not found' });
};

const createBook = async (req, res) => {
  try {
    const { book_id, title, author, availability_status, shelf_location } = req.body;
    
    const exists = store.findOne('books', { book_id });
    if (exists) {
      return res.status(400).json({ message: 'Book ID already exists. Please choose a unique ID.' });
    }

    const createdBook = store.create('books', { book_id, title, author, availability_status, shelf_location });
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateBook = async (req, res) => {
  try {
    const { book_id, title, author, availability_status, shelf_location } = req.body;
    const book = store.findById('books', req.params.id);

    if (book) {
      if (book_id && book_id !== book.book_id) {
        const idExists = store.findOne('books', { book_id });
        if (idExists) return res.status(400).json({ message: 'Target Book ID already actively exists.' });
      }

      // Detect status change for notifications
      const isStatusBecomingAvailable = book.availability_status === 'Issued' && availability_status === 'Available';

      const updatedBook = store.updateById('books', req.params.id, {
        book_id: book_id || book.book_id,
        title: title || book.title,
        author: author || book.author,
        availability_status: availability_status || book.availability_status,
        shelf_location: shelf_location || book.shelf_location
      });

      // Trigger Notifications
      if (isStatusBecomingAvailable) {
         store.updateMany('notifications', { book: String(book._id), status: 'Pending' }, { status: 'Sent' });
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
  const deleted = store.deleteById('books', req.params.id);
  if (deleted) {
    res.json({ message: 'Book removed' });
  } else {
    res.status(404).json({ message: 'Book not found' });
  }
};

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
