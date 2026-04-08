import React, { useState, useEffect } from 'react';
import { Search, Bell, BellOff } from 'lucide-react';
import api from '../api/axios';

export default function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    try {
      const [booksRes, notifRes] = await Promise.all([
        api.get(`/books?keyword=${search}`),
        api.get('/notifications')
      ]);
      setBooks(booksRes.data);
      setNotifications(notifRes.data);
    } catch(err) {
      console.error(err);
    }
  };

  const handleNotifyRequest = async (bookId) => {
    try {
      await api.post('/notifications', { bookId });
      setToastMessage('Notification requested successfully!');
      fetchData(); // Refresh to update the disabled state
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to request notification.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleCancelNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}/dismiss`);
      setToastMessage('Notification request cancelled successfully');
      fetchData();
      setTimeout(() => setToastMessage(''), 3000);
    } catch (err) {
      setToastMessage(err.response?.data?.message || 'Failed to cancel notification.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-md shadow-lg z-50 text-sm font-medium transition-all animate-bounce">
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4 sm:mb-0">Library Directory</h1>
        <div className="relative rounded-md shadow-sm max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
            placeholder="Search books..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {books.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No books found.</div>
          ) : (
            books.map((book) => {
              // Determine if a pending notification exists for this book
              const pendingNotif = notifications.find(n => n.book?._id === book._id && n.status === 'Pending');
              const isRequested = !!pendingNotif;

              return (
                <li key={book._id}>
                  <div className="px-4 py-4 flex items-center sm:px-6">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="truncate w-full sm:w-1/2">
                        <div className="flex text-sm">
                          <p className="font-medium text-primary-600 truncate">{book.title}</p>
                          <p className="ml-2 flex-shrink-0 font-normal text-gray-500 bg-gray-100 px-2 rounded hidden sm:inline">
                            {book.book_id}
                          </p>
                        </div>
                        <div className="mt-1 flex text-sm text-gray-500">
                          by {book.author}
                        </div>
                        <div className="mt-2 flex text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          Shelf: {book.shelf_location}
                        </div>
                      </div>

                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5 flex flex-col sm:items-end items-start gap-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                          book.availability_status === 'Available' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {book.availability_status}
                        </span>
                        
                        {/* Notify Me Logic */}
                        {book.availability_status === 'Issued' && (
                          isRequested ? (
                            <button
                              onClick={() => handleCancelNotification(pendingNotif._id)}
                              className="mt-1 inline-flex items-center text-xs font-medium text-red-600 hover:text-red-800 bg-red-50 px-3 py-1.5 rounded hover:bg-red-100 transition shadow-sm"
                            >
                              <BellOff className="w-3 h-3 mr-1" /> Cancel Notification
                            </button>
                          ) : (
                            <button
                              onClick={() => handleNotifyRequest(book._id)}
                              className="mt-1 inline-flex items-center text-xs font-medium text-primary-600 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded hover:bg-primary-100 transition shadow-sm"
                            >
                              <Bell className="w-3 h-3 mr-1" /> Notify Me
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
