import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, Bell, X } from 'lucide-react';
import useAuthStore from '../store/useAuth';
import api from '../api/axios';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      // Only keep 'Sent' notifications for the dropdown alerts
      setNotifications(data.filter(n => n.status === 'Sent'));
    } catch (e) {
      console.error('Error fetching notifications');
    }
  };

  const handleDismiss = async (id) => {
    try {
      await api.delete(`/notifications/${id}/dismiss`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      if (notifications.length === 1) setShowDropdown(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <span className="ml-2 font-bold text-xl text-gray-900 hidden sm:block">SmartLib</span>
            </div>
            <div className="ml-4 sm:ml-8 flex space-x-4 sm:space-x-8">
              <Link to="/" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/books" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Books
              </Link>
              <Link to="/seats" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                Seats
              </Link>
              {user?.role === 'Administrator' && (
                <Link to="/admin" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Notification Bell */}
            <div className="relative mr-4 sm:mr-6">
              <button 
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none relative"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <Bell className="h-6 w-6" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                )}
              </button>

              {/* Dropdown Modal */}
              {showDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
                  <div className="py-2 bg-gray-50 px-4 border-b">
                    <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">Alerts ({notifications.length})</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-gray-500 text-center">You're all caught up!</p>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif._id} className="px-4 py-3 border-b hover:bg-gray-50 flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900 leading-tight">
                              {notif.book?.title} is Available!
                            </p>
                            <p className="text-xs text-green-600 mt-1 font-medium">Ready for pickup</p>
                          </div>
                          <button onClick={() => handleDismiss(notif._id)} className="text-gray-400 hover:text-red-500 ml-4 p-1">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="hidden sm:flex sm:items-center">
              <span className="text-sm text-gray-500 mr-4 font-medium">{user?.name}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
              title="Logout"
            >
              <LogOut className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
