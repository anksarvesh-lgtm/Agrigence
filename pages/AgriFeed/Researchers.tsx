
import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { User, AgriConnection } from '../../types';
import { Search, MapPin, Briefcase, GraduationCap, UserPlus, Check, X } from 'lucide-react';

const Researchers: React.FC = () => {
  const { user: currentUser } = useOutletContext<{ user: User }>();
  const [researchers, setResearchers] = useState<User[]>([]);
  const [connections, setConnections] = useState<AgriConnection[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [u, c] = await Promise.all([
        mockBackend.getUsers(),
        mockBackend.getAgriConnections(currentUser.id)
      ]);
      setResearchers(u.filter(r => r.id !== currentUser.id));
      setConnections(c);
      setLoading(false);
    };
    fetchData();
  }, [currentUser.id]);

  const getConnectionInfo = (researcherId: string) => {
    const conn = connections.find(c => 
      (c.senderId === currentUser.id && c.receiverId === researcherId) ||
      (c.senderId === researcherId && c.receiverId === currentUser.id)
    );
    if (!conn) return null;
    return {
      id: conn.id,
      status: conn.status,
      isSender: conn.senderId === currentUser.id
    };
  };

  const handleConnect = async (researcherId: string) => {
    await mockBackend.sendConnectionRequest(currentUser.id, researcherId);
    const c = await mockBackend.getAgriConnections(currentUser.id);
    setConnections(c);
  };

  const handleAccept = async (connectionId: string) => {
    await mockBackend.updateConnectionStatus(connectionId, 'ACCEPTED');
    const c = await mockBackend.getAgriConnections(currentUser.id);
    setConnections(c);
  };

  const handleReject = async (connectionId: string) => {
    await mockBackend.updateConnectionStatus(connectionId, 'REJECTED');
    const c = await mockBackend.getAgriConnections(currentUser.id);
    setConnections(c);
  };

  const filteredResearchers = researchers.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.occupation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4">
        <h2 className="text-xl font-bold">Researchers Directory</h2>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search by name, field, or country..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-green-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full flex justify-center p-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          </div>
        ) : filteredResearchers.length === 0 ? (
          <div className="col-span-full text-center p-10 text-stone-500">
            No researchers found matching your search.
          </div>
        ) : (
          filteredResearchers.map((researcher) => {
            const connInfo = getConnectionInfo(researcher.id);
            return (
              <div key={researcher.id} className="bg-white border border-stone-200 rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col items-center text-center">
                <Link to={`/agri-feed/profile/${researcher.id}`} className="group">
                  <img 
                    src={researcher.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${researcher.name}`} 
                    alt={researcher.name} 
                    className="w-24 h-24 rounded-full bg-stone-100 mb-4 border-4 border-white shadow-sm group-hover:scale-105 transition-transform"
                  />
                </Link>
                <Link to={`/agri-feed/profile/${researcher.id}`} className="hover:underline">
                  <h3 className="font-bold text-lg">{researcher.name}</h3>
                </Link>
                <p className="text-green-600 font-medium text-sm mb-1">{researcher.occupation || 'Researcher'}</p>
                <p className="text-stone-500 text-xs mb-4 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {researcher.country || 'Global'}
                </p>

                <div className="w-full space-y-2 mb-4 text-left text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-stone-400" />
                    <span className="truncate">{researcher.userType || 'Individual'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-3 h-3 text-stone-400" />
                    <span className="truncate">{researcher.subscriptionTier || 'Member'}</span>
                  </div>
                </div>

                <div className="mt-auto w-full">
                  {connInfo?.status === 'ACCEPTED' ? (
                    <button className="w-full bg-stone-100 text-stone-600 font-bold py-2 rounded-xl flex items-center justify-center gap-2 cursor-default">
                      <Check className="w-4 h-4" /> Connected
                    </button>
                  ) : connInfo?.status === 'PENDING' ? (
                    connInfo.isSender ? (
                      <button className="w-full bg-stone-100 text-stone-400 font-bold py-2 rounded-xl flex items-center justify-center gap-2 cursor-default">
                        Pending Request
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAccept(connInfo.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                        >
                          <Check className="w-4 h-4" /> Accept
                        </button>
                        <button 
                          onClick={() => handleReject(connInfo.id)}
                          className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 font-bold py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                        >
                          <X className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )
                  ) : (
                    <button 
                      onClick={() => handleConnect(researcher.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <UserPlus className="w-4 h-4" /> Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Researchers;
