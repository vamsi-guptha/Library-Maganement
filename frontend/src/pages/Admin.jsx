import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { Trash2, Edit2, Search } from 'lucide-react';

export default function Admin() {
  const [books, setBooks] = useState([]);
  const [seats, setSeats] = useState([]);
  
  // Book States
  const [newBook, setNewBook] = useState({ book_id: '', title: '', author: '', shelf_location: '', availability_status: 'Available' });
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [editBook, setEditBook] = useState(null);
  const [searchBook, setSearchBook] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Seat States
  const [newSeat, setNewSeat] = useState({ floor: 1, section: 'A', gridRow: 0, gridCol: 0 });
  const [seatError, setSeatError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [booksRes, seatsRes] = await Promise.all([
        api.get('/books'),
        api.get('/seats')
      ]);
      setBooks(booksRes.data);
      setSeats(seatsRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  /* ==== BOOK MODULE LOGIC ==== */
  const handleAddBook = async (e) => {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');
    try {
      await api.post('/books', newBook);
      setBookSuccess('Book successfully added!');
      setNewBook({ book_id: '', title: '', author: '', shelf_location: '', availability_status: 'Available' });
      fetchData();
      setTimeout(() => setBookSuccess(''), 3000);
    } catch (err) {
      setBookError(err.response?.data?.message || 'Failed to add book.');
    }
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();
    setBookError('');
    try {
      await api.put(`/books/${editBook._id}`, editBook);
      setEditBook(null);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update book.');
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you absolutely sure you want to delete this book? This action cannot be undone.')) {
      await api.delete(`/books/${id}`);
      fetchData();
    }
  };

  const filteredBooks = useMemo(() => {
    return books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(searchBook.toLowerCase()) || 
                            b.author.toLowerCase().includes(searchBook.toLowerCase()) || 
                            b.book_id.toLowerCase().includes(searchBook.toLowerCase());
      const matchesStatus = statusFilter === 'All' ? true : b.availability_status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [books, searchBook, statusFilter]);

  /* ==== SEAT MODULE LOGIC ==== */
  const cycleSeatStatus = async (seat) => {
    const mapping = { 'Available': 'Occupied', 'Occupied': 'Reserved', 'Reserved': 'Available' };
    await api.put(`/seats/${seat._id}`, { status: mapping[seat.status] });
    fetchData();
  };

  const handleAddSeat = async (e) => {
    e.preventDefault();
    setSeatError('');
    try {
      await api.post('/seats', {
        floor: Number(newSeat.floor),
        section: newSeat.section,
        gridRow: Number(newSeat.gridRow),
        gridCol: Number(newSeat.gridCol),
        status: 'Available'
      });
      fetchData();
    } catch (err) {
      setSeatError(err.response?.data?.message || 'Failed to add seat. Coordinates might already exist.');
    }
  };

  const removeSeat = async (id) => {
    if(confirm('Are you sure you want to remove this seat?')) {
      await api.delete(`/seats/${id}`);
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <h1 className="text-3xl font-semibold text-gray-900">Administration Panel</h1>
      
      {/* ===== BOOKS SECTION ===== */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-medium text-gray-800 border-b pb-2">Manage Books</h2>
        
        {/* ADD BOOK FORM */}
        <form onSubmit={handleAddBook} className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Add New Book to Library</h3>
          {bookError && <p className="text-red-500 text-xs mb-2">{bookError}</p>}
          {bookSuccess && <p className="text-green-500 text-xs mb-2">{bookSuccess}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500">Book ID</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newBook.book_id} onChange={e => setNewBook({...newBook, book_id: e.target.value})} placeholder="e.g. B-106"/>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-gray-500">Title</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} placeholder="Book Title"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Author</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} placeholder="Author Name"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Shelf</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newBook.shelf_location} onChange={e => setNewBook({...newBook, shelf_location: e.target.value})} placeholder="e.g. CS-101"/>
            </div>
            <div>
              <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition">Add Book</button>
            </div>
          </div>
        </form>

        {/* BOOK LIST CONTROLS */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="relative rounded-md shadow-sm w-full sm:w-1/2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none border-y border-l rounded-l-md border-gray-300 bg-gray-50">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
              placeholder="Search by ID, Title, or Author..."
              value={searchBook}
              onChange={(e) => setSearchBook(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-auto flex items-center gap-2">
            <label className="text-sm text-gray-600 font-medium">Filter:</label>
            <select className="border border-gray-300 rounded-md py-1.5 px-3 text-sm focus:ring-primary-500" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Issued">Issued</option>
            </select>
          </div>
        </div>

        {/* BOOKS TABLE */}
        <div className="overflow-x-auto max-h-[500px] border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200 relative">
            <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Book ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Title & Author</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Shelf</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 overflow-y-auto">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No books found matching your criteria.</td>
                </tr>
              ) : (
                filteredBooks.map(book => (
                  <tr key={book._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">{book.book_id}</td>
                    <td className="px-6 py-4 text-sm">
                      <p className="font-semibold text-gray-900">{book.title}</p>
                      <p className="text-gray-500 text-xs">by {book.author}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.shelf_location}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        book.availability_status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {book.availability_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => setEditBook(book)} className="text-primary-600 hover:text-primary-900 mr-4 inline-flex items-center" title="Edit Book">
                        <Edit2 className="w-4 h-4 mr-1"/> Edit
                      </button>
                      <button onClick={() => handleDeleteBook(book._id)} className="text-red-500 hover:text-red-700 inline-flex items-center" title="Delete Book">
                        <Trash2 className="w-4 h-4 mr-1"/> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== SEATS SECTION ===== */}
      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-medium text-gray-800 border-b pb-2">Manage Seats Map Layout</h2>
        
        <form onSubmit={handleAddSeat} className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <h3 className="font-medium text-sm text-gray-700 mb-3">Add New Seat to Map</h3>
          {seatError && <p className="text-red-500 text-xs mb-2">{seatError}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500">Floor</label>
              <input type="number" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newSeat.floor} onChange={e => setNewSeat({...newSeat, floor: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Section</label>
              <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newSeat.section} onChange={e => setNewSeat({...newSeat, section: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Row Pos</label>
              <input type="number" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newSeat.gridRow} onChange={e => setNewSeat({...newSeat, gridRow: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Col Pos</label>
              <input type="number" required min="0" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm focus:ring-primary-500 border p-2" value={newSeat.gridCol} onChange={e => setNewSeat({...newSeat, gridCol: e.target.value})} />
            </div>
            <div>
              <button type="submit" className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700">Spawn Seat</button>
            </div>
          </div>
        </form>

        <div className="overflow-x-auto max-h-[400px] border border-gray-200 rounded-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="sticky top-0 bg-gray-50 shadow-sm z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coordinate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {seats.map(seat => (
                <tr key={seat._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-r">Floor {seat.floor} - {seat.section}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Row {seat.gridRow} : Col {seat.gridCol}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      seat.status === 'Available' ? 'bg-green-100 text-green-800' :
                      seat.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {seat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm flex justify-end gap-3 items-center">
                    <button onClick={() => cycleSeatStatus(seat)} className="text-primary-600 hover:text-primary-900 font-medium text-xs border border-gray-300 rounded px-2 py-1 hover:bg-gray-100 transition shadow-sm">Cycle Status</button>
                    <button onClick={() => removeSeat(seat._id)} className="text-red-500 hover:text-red-700 transition" title="Delete Seat"><Trash2 className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT BOOK MODAL */}
      {editBook && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full relative shadow-xl">
            <h3 className="text-xl font-medium text-gray-900 mb-4 border-b pb-2">Edit Book Details</h3>
            <form onSubmit={handleUpdateBook} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Book ID</label>
                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 border p-2" value={editBook.book_id} onChange={e => setEditBook({...editBook, book_id: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 border p-2" value={editBook.title} onChange={e => setEditBook({...editBook, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author</label>
                <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 border p-2" value={editBook.author} onChange={e => setEditBook({...editBook, author: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shelf Location</label>
                  <input type="text" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 border p-2" value={editBook.shelf_location} onChange={e => setEditBook({...editBook, shelf_location: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Availability</label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-primary-500 border p-2" value={editBook.availability_status} onChange={e => setEditBook({...editBook, availability_status: e.target.value})}>
                    <option value="Available">Available</option>
                    <option value="Issued">Issued</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setEditBook(null)} className="py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
