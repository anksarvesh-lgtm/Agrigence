import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Activity, Globe, Monitor, Smartphone, Clock, 
  Search, Download, Filter, MapPin, FileText, ChevronLeft, ChevronRight
} from 'lucide-react';
import { mockBackend } from '../../services/mockBackend';
import { WebsiteVisitor } from '../../types';
import * as XLSX from 'xlsx';

const VisitorAnalytics: React.FC = () => {
  const [visitors, setVisitors] = useState<WebsiteVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDevice, setFilterDevice] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await mockBackend.getVisitors();
    setVisitors(data);
    setLoading(false);
  };

  const handleExport = () => {
    const exportData = filteredVisitors.map(v => ({
      'Visitor ID': v.visitor_id,
      'IP Address': v.ip_address,
      'Country': v.country,
      'City': v.city,
      'Device': v.device_type,
      'OS': v.os,
      'Browser': v.browser,
      'First Visit': new Date(v.first_visit).toLocaleString(),
      'Last Visit': new Date(v.last_visit).toLocaleString(),
      'Duration (s)': v.visit_duration,
      'Pages Visited': v.pages_visited,
      'Traffic Source': v.traffic_source,
      'Is Bot': v.is_bot ? 'Yes' : 'No'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitors");
    XLSX.writeFile(wb, `Visitor_Analytics_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Calculate stats
  const totalVisitors = visitors.length;
  const uniqueVisitors = new Set(visitors.map(v => v.visitor_id)).size;
  const activeUsers = visitors.filter(v => {
    const lastVisit = new Date(v.last_visit).getTime();
    const now = new Date().getTime();
    return (now - lastVisit) < 30 * 60 * 1000; // Active in last 30 mins
  }).length;
  
  const todayVisits = visitors.filter(v => {
    const visitDate = new Date(v.last_visit).toDateString();
    const today = new Date().toDateString();
    return visitDate === today;
  }).length;

  // Filtering
  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = 
      v.ip_address.includes(searchTerm) || 
      v.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.visitor_id.includes(searchTerm);
      
    const matchesDevice = filterDevice === 'All' || v.device_type === filterDevice;
    
    return matchesSearch && matchesDevice && !v.is_bot; // Hide bots by default in main view
  });

  // Pagination
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const paginatedVisitors = filteredVisitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return <div className="p-8 text-center text-stone-500">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-agri-primary">Web Intelligence System</h1>
          <p className="text-sm text-stone-500">Comprehensive visitor tracking and traffic analytics.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-agri-primary text-white text-sm font-bold rounded-lg hover:bg-agri-primary/90 transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Visitors</p>
            <p className="text-2xl font-bold text-agri-primary">{totalVisitors}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Now</p>
            <p className="text-2xl font-bold text-agri-primary">{activeUsers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Globe size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Unique Visitors</p>
            <p className="text-2xl font-bold text-agri-primary">{uniqueVisitors}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Today's Visits</p>
            <p className="text-2xl font-bold text-agri-primary">{todayVisits}</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by IP, Country, City or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-agri-secondary outline-none text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-stone-400" />
          <select 
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-lg outline-none text-sm font-medium"
          >
            <option value="All">All Devices</option>
            <option value="Desktop">Desktop</option>
            <option value="Mobile">Mobile</option>
            <option value="Tablet">Tablet</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Visitor</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Device / OS</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Source</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Activity</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Last Visit</th>
              </tr>
            </thead>
            <tbody>
              {paginatedVisitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-500">No visitors found matching criteria.</td>
                </tr>
              ) : (
                paginatedVisitors.map((v, idx) => (
                  <tr key={idx} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="text-sm font-bold text-agri-primary">{v.ip_address}</div>
                      <div className="text-xs text-stone-500 font-mono mt-1">{v.visitor_id.substring(0, 12)}...</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm font-medium text-stone-700">
                        <MapPin size={14} className="text-stone-400" />
                        {v.city !== 'Unknown' ? `${v.city}, ` : ''}{v.country}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-stone-700">
                        {v.device_type === 'Desktop' ? <Monitor size={14} /> : <Smartphone size={14} />}
                        <span>{v.browser} on {v.os}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 text-[10px] font-bold uppercase tracking-wider rounded-md">
                        {v.traffic_source}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-medium text-stone-700">{v.pages_visited} pages</div>
                      <div className="text-xs text-stone-500 mt-1">{Math.floor(v.visit_duration / 60)}m {v.visit_duration % 60}s</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-stone-700">{new Date(v.last_visit).toLocaleDateString()}</div>
                      <div className="text-xs text-stone-500 mt-1">{new Date(v.last_visit).toLocaleTimeString()}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
            <span className="text-sm text-stone-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVisitors.length)} of {filteredVisitors.length} entries
            </span>
            <div className="flex gap-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-stone-200 rounded-lg bg-white disabled:opacity-50 hover:bg-stone-100"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-stone-200 rounded-lg bg-white disabled:opacity-50 hover:bg-stone-100"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorAnalytics;
