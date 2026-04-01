import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { WebServiceRequest } from '../../types';
import { Loader2, Globe, FileText, CheckCircle, Clock, Search, Filter } from 'lucide-react';

const WebServicesAdmin: React.FC = () => {
  const [requests, setRequests] = useState<WebServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await mockBackend.getWebServiceRequests();
      // Sort by newest first
      setRequests(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    try {
      await mockBackend.updateWebServiceRequestStatus(id, newStatus);
      loadRequests();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesFilter = filter === 'All' || req.status === filter;
    const matchesSearch = req.fullName.toLowerCase().includes(search.toLowerCase()) || 
                          req.email.toLowerCase().includes(search.toLowerCase()) ||
                          req.category.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-agri-secondary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <Globe className="text-agri-secondary" /> Web Service Requests
          </h1>
          <p className="text-stone-500 text-sm">Manage and track on-demand service inquiries.</p>
        </div>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search requests..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:border-agri-secondary outline-none"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <select 
              className="pl-10 pr-8 py-2 bg-white border border-stone-200 rounded-xl text-sm focus:border-agri-secondary outline-none appearance-none cursor-pointer"
              value={filter}
              onChange={e => setFilter(e.target.value)}
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Client</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Category</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Date</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Status</th>
                <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-stone-500 italic">
                    No requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map(req => (
                  <tr key={req.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-black">{req.fullName}</div>
                      <div className="text-xs text-stone-500">{req.email}</div>
                      <div className="text-xs text-stone-500">{req.phoneNumber}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-agri-secondary/10 text-agri-secondary px-3 py-1 rounded-full text-xs font-bold">
                        {req.category}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-stone-600">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <select 
                        className={`text-xs font-bold px-3 py-1 rounded-full border outline-none cursor-pointer ${
                          req.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                          req.status === 'In Progress' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                          'bg-green-50 text-green-600 border-green-200'
                        }`}
                        value={req.status}
                        onChange={(e) => handleStatusChange(req.id, e.target.value as any)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => alert(`Requirement:\n${req.description}\n\nBudget: ${req.budgetRange || 'N/A'}\nDeadline: ${req.deadline || 'N/A'}`)}
                          className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-white hover:text-agri-secondary border border-transparent hover:border-stone-200 transition-all"
                          title="View Details"
                        >
                          <FileText size={16} />
                        </button>
                        {req.fileUrl && (
                          <a 
                            href={req.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-white hover:text-agri-secondary border border-transparent hover:border-stone-200 transition-all"
                            title="Download Attachment"
                          >
                            <Globe size={16} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WebServicesAdmin;
