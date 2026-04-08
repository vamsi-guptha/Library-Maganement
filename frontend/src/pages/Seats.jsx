import React, { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { X, Check, Search } from 'lucide-react';

export default function Seats() {
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [filterFloor, setFilterFloor] = useState('All');

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        const { data } = await api.get('/seats');
        setSeats(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchSeats();
  }, []);

  const floors = ['All', ...new Set(seats.map(s => s.floor))].sort((a,b) => a === 'All' ? -1 : a - b);
  
  const filteredSeats = useMemo(() => {
    if (filterFloor === 'All') return seats;
    return seats.filter(s => s.floor === Number(filterFloor));
  }, [seats, filterFloor]);

  // Group by Section
  const sections = useMemo(() => {
    const map = {};
    filteredSeats.forEach(s => {
      const key = `Floor ${s.floor} - ${s.section}`;
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
    return map;
  }, [filteredSeats]);

  const nearestSeat = useMemo(() => {
    const available = seats.filter(s => s.status === 'Available');
    if (!available.length) return null;
    return available.reduce((prev, curr) => {
      const prevDist = Math.sqrt(Math.pow(prev.gridRow, 2) + Math.pow(prev.gridCol, 2));
      const currDist = Math.sqrt(Math.pow(curr.gridRow, 2) + Math.pow(curr.gridCol, 2));
      return (prevDist < currDist) ? prev : curr;
    });
  }, [seats]);

  const totalAvailable = seats.filter(s => s.status === 'Available').length;

  const getSeatColor = (status, isNearest) => {
    let color = '';
    if (status === 'Available') color = 'bg-green-500 hover:bg-green-600 cursor-pointer';
    else if (status === 'Occupied') color = 'bg-red-500 hover:bg-red-600 cursor-pointer';
    else if (status === 'Reserved') color = 'bg-yellow-500 hover:bg-yellow-600 cursor-pointer';
    
    if (isNearest) {
      color += ' ring-4 ring-blue-500 ring-offset-2 animate-pulse';
    }
    return color;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-lg shadow">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Seat Availability Map</h1>
          <p className="text-sm text-gray-500 mt-1">Total Available Seats Campus-Wide: <span className="font-bold text-green-600">{totalAvailable}</span></p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-4">
          <div className="flex items-center text-sm"><span className="w-3 h-3 bg-green-500 mr-2 rounded-sm inline-block"></span> Available</div>
          <div className="flex items-center text-sm"><span className="w-3 h-3 bg-red-500 mr-2 rounded-sm inline-block"></span> Occupied</div>
          <div className="flex items-center text-sm"><span className="w-3 h-3 bg-yellow-500 mr-2 rounded-sm inline-block"></span> Reserved</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Filter by Floor:</label>
        <select 
          className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-primary-500 focus:border-primary-500"
          value={filterFloor} 
          onChange={(e) => setFilterFloor(e.target.value)}
        >
          {floors.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Map Renderer */}
      <div className="space-y-12">
        {Object.keys(sections).map(sectionKey => {
          const sectionSeats = sections[sectionKey];
          // Determine grid layout size
          const maxRow = Math.max(...sectionSeats.map(s => s.gridRow));
          const maxCol = Math.max(...sectionSeats.map(s => s.gridCol));
          
          return (
            <div key={sectionKey} className="bg-white shadow rounded-lg p-6 overflow-x-auto">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-6">{sectionKey}</h3>
              <div 
                className="grid gap-3"
                style={{ 
                  gridTemplateRows: `repeat(${maxRow + 1}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))`,
                  width: 'fit-content'
                }}
              >
                {sectionSeats.map(seat => {
                  const isNearest = nearestSeat?._id === seat._id;
                  return (
                    <div 
                      key={seat._id}
                      onClick={() => setSelectedSeat(seat)}
                      className={`w-12 h-12 sm:w-16 sm:h-16 rounded-md shadow-sm flex items-center justify-center text-white font-medium text-xs transition-colors duration-200 ${getSeatColor(seat.status, isNearest)}`}
                      style={{ gridRow: seat.gridRow + 1, gridColumn: seat.gridCol + 1 }}
                      title={`Row ${seat.gridRow}, Col ${seat.gridCol} - ${seat.status}`}
                    >
                      {seat.gridRow}-{seat.gridCol}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seat Details Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full relative">
            <button 
              onClick={() => setSelectedSeat(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Seat Information</h3>
            <div className="space-y-3">
              <p><span className="text-sm text-gray-500">Floor:</span> <span className="font-medium text-gray-900">{selectedSeat.floor}</span></p>
              <p><span className="text-sm text-gray-500">Section:</span> <span className="font-medium text-gray-900">{selectedSeat.section}</span></p>
              <p><span className="text-sm text-gray-500">Coordinate:</span> <span className="font-medium text-gray-900">R{selectedSeat.gridRow} - C{selectedSeat.gridCol}</span></p>
              <p>
                <span className="text-sm text-gray-500">Status:</span> 
                <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedSeat.status === 'Available' ? 'bg-green-100 text-green-800' :
                  selectedSeat.status === 'Reserved' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {selectedSeat.status}
                </span>
              </p>
              {nearestSeat?._id === selectedSeat._id && (
                <div className="mt-4 bg-blue-50 p-3 rounded-md flex items-start">
                  <Check className="w-5 h-5 text-blue-400 mt-0.5 mr-2" />
                  <p className="text-sm text-blue-700">This is currently the nearest available seat to the main entrance!</p>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setSelectedSeat(null)}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
