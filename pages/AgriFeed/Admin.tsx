
import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { User, AgriPost, AgriNotification } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  AlertTriangle, 
  Trash2, 
  Ban, 
  CheckCircle, 
  BarChart3,
  Filter,
  Search,
  Lock,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

const AgriFeedAdmin: React.FC = () => {
  const { user: currentUser } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'reports' | 'analytics'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      navigate('/agri-feed/feed');
      return;
    }

    const fetchData = async () => {
      const [u, p, s] = await Promise.all([
        mockBackend.getUsers(),
        mockBackend.getAgriPosts(),
        mockBackend.getAgriStats()
      ]);
      setUsers(u);
      setPosts(p);
      setStats(s);
      setLoading(false);
    };
    fetchData();
  }, [currentUser, navigate]);

  const handleDeletePost = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await mockBackend.deleteAgriPost(id, currentUser?.id || 'admin', currentUser?.role);
        setPosts(posts.filter(p => p.id !== id));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleBanUser = async (id: string) => {
    if (window.confirm('Are you sure you want to ban this user?')) {
      // await mockBackend.banUser(id); // Need to implement in backend
      setUsers(users.map(u => u.id === id ? { ...u, status: 'BLOCKED' } : u));
    }
  };

  const handleToggleVerify = async (userId: string, currentStatus: boolean) => {
    try {
      await mockBackend.verifyUser(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, isVerified: !currentStatus } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await mockBackend.updateUser(userId, { occupation: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, occupation: newRole } : u));
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (currentUser.role !== 'ADMIN' && currentUser.role !== 'SUPER_ADMIN') return null;

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Admin Header */}
      <div className="bg-stone-900 text-white p-6 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">AgriFeed Admin Console</h2>
              <p className="text-stone-400 text-sm">Platform Moderation & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="font-bold text-sm">{currentUser.name}</p>
              <p className="text-green-500 text-[10px] font-bold uppercase tracking-widest">Two-Factor Enabled</p>
            </div>
            <img 
              src={currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`} 
              alt={currentUser.name} 
              className="w-10 h-10 rounded-full border-2 border-green-600"
            />
          </div>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'users', label: 'User Management', icon: <Users className="w-4 h-4" /> },
            { id: 'posts', label: 'Post Moderation', icon: <MessageSquare className="w-4 h-4" /> },
            { id: 'reports', label: 'Reported Content', icon: <AlertTriangle className="w-4 h-4" /> },
            { id: 'analytics', label: 'Platform Analytics', icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-green-600 text-white' : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6 flex-1">
        {loading ? (
          <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-green-600"></div></div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            {/* Toolbar */}
            <div className="p-4 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-50/50">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder={`Search ${activeTab}...`} 
                  className="w-full bg-white border border-stone-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-colors">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-colors">
                  Export Data
                </button>
              </div>
            </div>

            {/* Content Table */}
            <div className="overflow-x-auto">
              {activeTab === 'users' && (
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Verification</th>
                      <th className="px-6 py-4">Role/Field</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.profilePhotoUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-10 h-10 rounded-full bg-stone-100 object-cover" />
                            <div>
                              <p className="font-bold text-sm flex items-center gap-1">
                                {user.name}
                                {user.isVerified && <CheckCircle className="w-3 h-3 text-green-600 fill-green-50" />}
                              </p>
                              <p className="text-xs text-stone-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleToggleVerify(user.id, !!user.isVerified)}
                            className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest transition-all ${
                              user.isVerified 
                                ? 'bg-green-600 text-white shadow-md shadow-green-600/20' 
                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                            }`}
                          >
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={user.occupation || 'Researcher'}
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="text-xs font-medium text-stone-600 bg-stone-100 px-2 py-1 rounded border-none focus:ring-1 focus:ring-green-500 outline-none"
                          >
                            <option value="Researcher">Researcher</option>
                            <option value="Scientist">Scientist</option>
                            <option value="Professor">Professor</option>
                            <option value="Agriculture Expert">Agriculture Expert</option>
                            <option value="Farmer">Farmer</option>
                            <option value="Student">Student</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${
                            user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {user.status || 'ACTIVE'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleBanUser(user.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Ban User"><Ban className="w-4 h-4" /></button>
                            <button className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="User Details"><MoreVertical className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'posts' && (
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-stone-500 text-[10px] font-bold uppercase tracking-widest border-b border-stone-100">
                    <tr>
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4">Content Preview</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Interactions</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-sm">{post.authorName}</p>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest">{format(new Date(post.timestamp), 'MMM dd, HH:mm')}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-stone-600 line-clamp-1 max-w-xs">{post.content}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold bg-stone-100 text-stone-500 px-2 py-1 rounded uppercase tracking-widest">{post.type}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-3 text-[10px] font-bold text-stone-400">
                            <span>L: {post.likes.length}</span>
                            <span>R: {post.replies.length}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button onClick={() => handleDeletePost(post.id)} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete Post"><Trash2 className="w-4 h-4" /></button>
                            <button className="p-2 text-stone-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Approve Post"><CheckCircle className="w-4 h-4" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {activeTab === 'analytics' && (
                <div className="p-10 text-center">
                  <BarChart3 className="w-16 h-16 text-green-600 mx-auto mb-4 opacity-20" />
                  <h3 className="text-xl font-bold mb-2">Advanced Analytics Dashboard</h3>
                  <p className="text-stone-500 max-w-md mx-auto">Real-time platform metrics, user engagement heatmaps, and content performance trends are being processed.</p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <p className="text-3xl font-bold text-green-600">{stats?.totalResearchers || 0}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Active Users</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <p className="text-3xl font-bold text-green-600">{stats?.postsThisWeek || 0}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">New Posts/Week</p>
                    </div>
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                      <p className="text-3xl font-bold text-green-600">{stats?.activeDiscussions || 0}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Discussions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Admin Footer */}
      <div className="p-6 bg-white border-t border-stone-200 flex items-center justify-between text-stone-400 text-xs font-medium">
        <div className="flex items-center gap-4">
          <p>© Agrigence | AgriFeed Admin Console</p>
          <div className="flex items-center gap-1 text-green-600">
            <Lock className="w-3 h-3" /> Secure Session
          </div>
        </div>
        <div className="flex gap-4">
          <button className="hover:text-stone-600">System Logs</button>
          <button className="hover:text-stone-600">Security Audit</button>
          <button className="hover:text-stone-600">API Status</button>
        </div>
      </div>
    </div>
  );
};

export default AgriFeedAdmin;
