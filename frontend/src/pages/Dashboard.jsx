import React, { useEffect, useState } from 'react';
import { BookOpen, Users } from 'lucide-react';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ booksTotal: 0, seatsAvailable: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [{ data: books }, { data: seats }] = await Promise.all([
          api.get('/books'),
          api.get('/seats')
        ]);
        
        setStats({
          booksTotal: books.length,
          seatsAvailable: seats.filter(s => s.status === 'Available').length,
          seatsTotal: seats.length
        });
      } catch (error) {
        console.error('Failed to fetch stats');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BookOpen className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Books</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">{stats.booksTotal}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-primary-500" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available Seats</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-primary-600">
                      {stats.seatsAvailable} <span className="text-sm font-normal text-gray-500">/ {stats.seatsTotal}</span>
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
