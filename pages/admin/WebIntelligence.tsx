import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, Users, Globe, Clock, Monitor, Smartphone, 
  Search, Filter, Download, MapPin, MousePointerClick, 
  Eye, RefreshCw, ChevronLeft, ChevronRight
} from 'lucide-react';
import { mockBackend } from '../../services/mockBackend';
import { WebsiteVisitor } from '../../types';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const WebIntelligence: React.FC = () => {
  const [visitors, setVisitors] = useState<WebsiteVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [filterDevice, setFilterDevice] = useState('All');
  const [filterCountry, setFilterCountry] = useState('All');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await mockBackend.getVisitors();
      // Filter out bots by default for analytics
      const realVisitors = data.filter(v => !v.is_bot);
      setVisitors(realVisitors);
    } catch (e) {
      console.error("Failed to load visitors", e);
    } finally {
      setLoading(false);
    }
  };

  // Analytics Calculations
  const totalVisitors = visitors.length;
  const uniqueVisitors = new Set(visitors.map(v => v.visitor_id)).size;
  const activeUsers = visitors.filter(v => {
    const lastVisit = new Date(v.last_visit).getTime();
    return (Date.now() - lastVisit) < 30 * 60 * 1000; // Active in last 30 mins
  }).length;
  
  const today = new Date().toISOString().split('T')[0];
  const todayVisits = visitors.filter(v => v.first_visit.startsWith(today)).length;

  const avgDuration = visitors.length > 0 
    ? Math.floor(visitors.reduce((acc, v) => acc + (v.visit_duration || 0), 0) / visitors.length)
    : 0;

  // Filtering
  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = 
      (v.ip_address || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.country || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDevice = filterDevice === 'All' || v.device_type === filterDevice;
    const matchesCountry = filterCountry === 'All' || v.country === filterCountry;
    
    return matchesSearch && matchesDevice && matchesCountry;
  });

  // Pagination
  const totalPages = Math.ceil(filteredVisitors.length / itemsPerPage);
  const currentVisitors = filteredVisitors.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Unique Countries for Filter
  const countries = ['All', ...Array.from(new Set(visitors.map(v => v.country).filter(Boolean)))];

  // Export Functions
  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredVisitors.map(v => ({
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
      'Landing Page': v.landing_page,
      'Referrer': v.referrer
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Visitors");
    XLSX.writeFile(wb, `Web_Intelligence_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF('landscape');
    doc.setFontSize(16);
    doc.text("Web Intelligence Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
    doc.text(`Total Visitors: ${filteredVisitors.length}`, 14, 35);

    const tableData = filteredVisitors.map(v => [
      v.ip_address || 'N/A',
      v.country || 'N/A',
      v.city || 'N/A',
      v.device_type || 'N/A',
      v.browser || 'N/A',
      v.pages_visited || 0,
      `${Math.floor((v.visit_duration || 0) / 60)}m ${(v.visit_duration || 0) % 60}s`,
      new Date(v.last_visit).toLocaleString()
    ]);

    (doc as any).autoTable({
      startY: 45,
      head: [['IP Address', 'Country', 'City', 'Device', 'Browser', 'Pages', 'Duration', 'Last Active']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [61, 43, 31] }
    });

    doc.save(`Web_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-agri-primary flex items-center gap-3">
            <Activity className="text-agri-secondary" />
            Web Intelligence System
          </h1>
          <p className="text-stone-500 text-sm mt-1">Real-time traffic analytics and visitor insights.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={loadData}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={20} />
          </button>
          <div className="relative group">
            <button className="px-4 py-2 bg-agri-primary text-white text-sm font-bold rounded-lg hover:bg-agri-primary/90 transition-colors flex items-center gap-2">
              <Download size={16} /> Export Data
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={exportCSV} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-agri-primary font-medium">Export as Excel/CSV</button>
              <button onClick={exportPDF} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 hover:text-agri-primary font-medium">Export as PDF</button>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total Visitors</p>
            <p className="text-2xl font-black text-agri-primary">{totalVisitors.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <Eye size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Unique Visitors</p>
            <p className="text-2xl font-black text-agri-primary">{uniqueVisitors.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Active Now (30m)</p>
            <p className="text-2xl font-black text-agri-primary">{activeUsers.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Avg. Duration</p>
            <p className="text-2xl font-black text-agri-primary">{Math.floor(avgDuration / 60)}m {avgDuration % 60}s</p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by IP, City, or Country..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agri-secondary"
          />
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-stone-400" />
            <select 
              value={filterDevice}
              onChange={(e) => { setFilterDevice(e.target.value); setCurrentPage(1); }}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-agri-secondary"
            >
              <option value="All">All Devices</option>
              <option value="Desktop">Desktop</option>
              <option value="Mobile">Mobile</option>
              <option value="Tablet">Tablet</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-stone-400" />
            <select 
              value={filterCountry}
              onChange={(e) => { setFilterCountry(e.target.value); setCurrentPage(1); }}
              className="border border-stone-200 rounded-lg px-3 py-2 text-sm text-stone-600 focus:outline-none focus:ring-2 focus:ring-agri-secondary max-w-[150px]"
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Visitor / IP</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Location</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Device & Browser</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Engagement</th>
                <th className="p-4 text-xs font-black text-stone-500 uppercase tracking-wider">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {currentVisitors.map((visitor, idx) => (
                <tr key={visitor.id || idx} className="hover:bg-stone-50 transition-colors">
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-agri-primary">{visitor.ip_address || 'Unknown IP'}</span>
                      <span className="text-xs text-stone-400 font-mono truncate w-32" title={visitor.visitor_id}>{visitor.visitor_id}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-stone-400" />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-stone-700">{visitor.city || 'Unknown City'}</span>
                        <span className="text-xs text-stone-500">{visitor.country || 'Unknown Country'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {visitor.device_type === 'Mobile' ? <Smartphone size={16} className="text-stone-400" /> : <Monitor size={16} className="text-stone-400" />}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-stone-700">{visitor.browser || 'Unknown'} on {visitor.os || 'Unknown'}</span>
                        <span className="text-xs text-stone-500">{visitor.screen_resolution || 'Unknown Res'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-stone-700 flex items-center gap-1">
                        <MousePointerClick size={14} className="text-stone-400" /> {visitor.pages_visited || 0} pages
                      </span>
                      <span className="text-xs text-stone-500">
                        {Math.floor((visitor.visit_duration || 0) / 60)}m {(visitor.visit_duration || 0) % 60}s
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-stone-700">
                        {new Date(visitor.last_visit).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-stone-500">
                        {new Date(visitor.last_visit).toLocaleTimeString()}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {currentVisitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500">
                    No visitors found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-stone-200 flex items-center justify-between bg-stone-50">
            <span className="text-sm text-stone-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredVisitors.length)} of {filteredVisitors.length} entries
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-stone-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-stone-200 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

export default WebIntelligence;
