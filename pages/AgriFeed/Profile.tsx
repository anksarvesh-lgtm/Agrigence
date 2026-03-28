
import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriPost, User, AgriConnection } from '../../types';
import PostCard from '../../components/AgriFeed/PostCard';
import { MapPin, Calendar, Briefcase, GraduationCap, UserPlus, Check, MessageSquare, Edit3, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useOutletContext<{ user: User }>();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [connections, setConnections] = useState<AgriConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    occupation: '',
    bio: '',
    avatar: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      const [u, p] = await Promise.all([
        mockBackend.getUser(id),
        mockBackend.getAgriPosts(),
      ]);
      setProfileUser(u);
      if (u) {
        setEditForm({
          name: u.name,
          occupation: u.occupation || '',
          bio: u.bio || '',
          avatar: u.avatar || ''
        });
      }
      setPosts(p.filter(post => post.authorId === id));
      setLoading(false);
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    let unsub: () => void;
    
    const setupSubscription = async () => {
      unsub = await mockBackend.subscribeToConnections(currentUser.id, (conns) => {
        setConnections(conns);
      });
    };
    
    setupSubscription();
    
    return () => {
      if (unsub) unsub();
    };
  }, [currentUser.id]);

  const getConnectionInfo = () => {
    if (!id) return null;
    const conn = connections.find(c => 
      (c.senderId === currentUser.id && c.receiverId === id) ||
      (c.senderId === id && c.receiverId === currentUser.id)
    );
    if (!conn) return null;
    return {
      id: conn.id,
      status: conn.status,
      isSender: conn.senderId === currentUser.id
    };
  };

  const handleConnect = async () => {
    if (!id) return;
    await mockBackend.sendConnectionRequest(currentUser.id, id);
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;
    
    await mockBackend.updateUser(profileUser.id, editForm);
    setProfileUser({ ...profileUser, ...editForm });
    setIsEditing(false);
  };

  if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div></div>;
  if (!profileUser) return <div className="p-10 text-center text-stone-500">User not found</div>;

  const connInfo = getConnectionInfo();

  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="h-48 bg-gradient-to-r from-green-600 to-emerald-700 relative">
        <div className="absolute -bottom-16 left-6">
          <div className="relative group">
            <img 
              src={profileUser.profilePhotoUrl || profileUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profileUser.name}`} 
              alt={profileUser.name} 
              className="w-32 h-32 rounded-full border-4 border-white bg-stone-100 shadow-lg object-cover"
            />
            {currentUser.id === profileUser.id && (
              <button 
                onClick={() => setIsEditing(true)}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
              >
                <Camera size={24} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-20 px-6 pb-6 border-b border-stone-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{profileUser.name}</h2>
            <p className="text-stone-500">@{profileUser.email.split('@')[0]}</p>
          </div>
          <div className="flex gap-2">
            {currentUser.id === profileUser.id ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-full font-bold text-stone-700 hover:bg-stone-50 transition-all"
              >
                <Edit3 size={18} />
                Edit Profile
              </button>
            ) : (
              <>
                <button className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors">
                  <MessageSquare className="w-5 h-5 text-stone-600" />
                </button>
                {connInfo?.status === 'ACCEPTED' ? (
                  <button className="bg-stone-100 text-stone-600 font-bold px-6 py-2 rounded-full flex items-center gap-2 cursor-default">
                    <Check className="w-4 h-4" /> Connected
                  </button>
                ) : connInfo?.status === 'PENDING' ? (
                  connInfo.isSender ? (
                    <button className="bg-stone-100 text-stone-400 font-bold px-6 py-2 rounded-full flex items-center gap-2 cursor-default">
                      Pending
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAccept(connInfo.id)}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 rounded-full flex items-center gap-1 transition-colors"
                      >
                        <Check className="w-4 h-4" /> Accept
                      </button>
                      <button 
                        onClick={() => handleReject(connInfo.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-600 font-bold px-4 py-2 rounded-full flex items-center gap-1 transition-colors"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )
                ) : (
                  <button 
                    onClick={handleConnect}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-2 rounded-full flex items-center gap-2 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" /> Connect
                  </button>
                )}
                {connInfo?.status === 'ACCEPTED' && (
                  <button 
                    onClick={() => navigate(`/agri-feed/inbox?startWith=${id}`)}
                    className="p-2 border border-stone-200 rounded-full hover:bg-stone-50 transition-colors"
                  >
                    <MessageSquare className="w-5 h-5 text-stone-600" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-stone-800 font-medium">{profileUser.occupation || 'Agricultural Researcher'}</p>
        {profileUser.bio && <p className="mt-2 text-stone-600 text-sm leading-relaxed">{profileUser.bio}</p>}

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-500">
          <div className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {profileUser.userType || 'Researcher'}</div>
          <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profileUser.country || 'Global'}</div>
          <div className="flex items-center gap-1"><GraduationCap className="w-4 h-4" /> {profileUser.subscriptionTier || 'Member'}</div>
          <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Joined {new Date(profileUser.joinedDate || Date.now()).toLocaleDateString()}</div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-xl font-bold">Edit Profile</h3>
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdateProfile} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    value={editForm.name}
                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Occupation / Title</label>
                  <input 
                    type="text" 
                    value={editForm.occupation}
                    onChange={e => setEditForm({ ...editForm, occupation: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="e.g. Agricultural Scientist"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Bio</label>
                  <textarea 
                    value={editForm.bio}
                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none h-24 resize-none"
                    placeholder="Tell us about your research and interests..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">Avatar URL (Optional)</label>
                  <input 
                    type="text" 
                    value={editForm.avatar}
                    onChange={e => setEditForm({ ...editForm, avatar: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/avatar.png"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Note: Uploaded profile photos from the main dashboard take priority.</p>
                </div>
                <div className="pt-4">
                  <button 
                    type="submit"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-200 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        <button className="flex-1 py-4 text-sm font-bold border-b-2 border-green-600 text-green-600">Posts</button>
        <button className="flex-1 py-4 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-colors">Replies</button>
        <button className="flex-1 py-4 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-colors">Media</button>
        <button className="flex-1 py-4 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-colors">Likes</button>
      </div>

      {/* Posts */}
      <div className="flex flex-col">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={currentUser.id}
              currentUserRole={currentUser.role}
              onLike={() => {}} // Implement like if needed
            />
          ))
        ) : (
          <div className="p-10 text-center text-stone-500">No posts yet</div>
        )}
      </div>
    </div>
  );
};

export default Profile;
