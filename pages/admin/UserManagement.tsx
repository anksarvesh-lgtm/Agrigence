
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { User, Role, EditorialRole, Tool, SubscriptionPlan } from '../../types';
import { Search, Edit, Trash2, Shield, Lock, Unlock, UserPlus, X, Globe, Smartphone, BookOpen, Activity, Plus, Minus, FileText, PenTool, Clock, Gift, RefreshCw } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';
import { useAuth } from '../../App';
import axios from 'axios';

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  
  // Limit Adjustment States
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [selectedUserForLimits, setSelectedUserForLimits] = useState<User | null>(null);
  const [allTools, setAllTools] = useState<Tool[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedGiftPlanId, setSelectedGiftPlanId] = useState<string>('');
  const [limitForm, setLimitForm] = useState({
    articleAdjustment: 0,
    blogAdjustment: 0,
    notes: '',
    adminEnabledTools: [] as string[],
    adminExpiryOverride: '' as string,
    userType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'INSTITUTE' | 'ORGANISATION' | 'FARMER'
  });
  const [isSavingLimits, setIsSavingLimits] = useState(false);

  const { confirm } = useConfirm();

  useEffect(() => {
    loadUsers();
    loadTools();
    loadPlans();
  }, []);

  const loadUsers = async () => {
    setUsers([...(await mockBackend.getUsers())]);
  };

  const loadTools = async () => {
    const tools = await mockBackend.getAllTools();
    setAllTools(tools);
  };

  const loadPlans = async () => {
    const p = await mockBackend.getPlans();
    setPlans(p);
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveUser = async () => {
    if (!editingUser?.email || !editingUser?.name) return;

    if (editingUser.id) {
      await mockBackend.updateUser(editingUser.id, editingUser);
    } else {
      await mockBackend.register(editingUser as User);
    }
    setIsModalOpen(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    const isConfirmed = await confirm({
        message: 'Are you sure you want to delete this user?',
        type: 'danger',
        trigger: e.currentTarget
    });

    if (isConfirmed) {
      await mockBackend.deleteUser(id);
      loadUsers();
    }
  };

  const handleToggleBlock = async (user: User) => {
    const newStatus = user.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';
    await mockBackend.updateUser(user.id, { status: newStatus });
    loadUsers();
  };

  const openLimitModal = (user: User) => {
    setSelectedUserForLimits(user);
    setLimitForm({
      articleAdjustment: user.adminArticleLimitAdjustment || 0,
      blogAdjustment: user.adminBlogLimitAdjustment || 0,
      notes: user.limitAdjustmentNotes || '',
      adminEnabledTools: user.adminEnabledTools || [],
      adminExpiryOverride: user.adminExpiryOverride || '',
      userType: user.userType || 'INDIVIDUAL'
    });
    setIsLimitModalOpen(true);
  };

  const handleGiftPlan = async () => {
    if (!selectedUserForLimits || !selectedGiftPlanId) return;
    const isConfirmed = await confirm({
      message: `Are you sure you want to gift this plan to ${selectedUserForLimits.name}? This will update their subscription immediately.`,
      type: 'default'
    });

    if (isConfirmed) {
      setIsSavingLimits(true);
      try {
        await mockBackend.adminGrantPlan(selectedUserForLimits.id, selectedGiftPlanId);
        setIsLimitModalOpen(false);
        loadUsers();
        alert("Plan gifted successfully!");
      } catch (err) {
        console.error(err);
        alert("Failed to gift plan");
      } finally {
        setIsSavingLimits(false);
      }
    }
  };

  const handleSaveLimits = async () => {
    if (!selectedUserForLimits) return;
    setIsSavingLimits(true);
    try {
      await mockBackend.updateUserLimitAdjustment(selectedUserForLimits.id, limitForm);
      setIsLimitModalOpen(false);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert("Failed to update limits");
    } finally {
      setIsSavingLimits(false);
    }
  };

  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const handleResetPassword = (user: User) => {
    setSelectedUserForReset(user);
    setNewPassword('');
    setIsResetPasswordModalOpen(true);
  };

  const submitResetPassword = async () => {
    if (!selectedUserForReset || !newPassword) return;
    setIsResettingPassword(true);
    try {
      await mockBackend.adminResetUserPassword(selectedUserForReset.id, newPassword);
      setIsResetPasswordModalOpen(false);
      alert("Password reset successfully.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to reset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const [syncing, setSyncing] = useState(false);
  const handleSyncUsers = async () => {
    if (!window.confirm('This will sync all users contacts to the WhatsApp database. Continue?')) return;
    setSyncing(true);
    try {
      const res = await axios.post('/api/whatsapp/sync-users');
      alert(`Successfully synced ${res.data.count} new contacts from ${res.data.totalProcessed} users.`);
    } catch (e: any) {
      alert('Sync failed: ' + (e.response?.data?.error || e.message));
    }
    setSyncing(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-admin-text">User Management</h1>
        {isSuperAdmin && (
          <div className="flex gap-2">
            <button 
              onClick={handleSyncUsers}
              disabled={syncing}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-md ${syncing ? 'bg-stone-200 text-stone-500 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-black'}`}
            >
              <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
              {syncing ? 'Syncing...' : 'Sync WhatsApp Contacts'}
            </button>
            <button 
              onClick={() => { setEditingUser({}); setIsModalOpen(true); }}
              className="bg-agri-secondary hover:bg-agri-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-md"
            >
              <UserPlus size={18} /> Add User
            </button>
          </div>
        )}
      </div>

      <div className="bg-admin-panel border border-admin-border rounded-2xl overflow-hidden shadow-admin">
        <div className="p-4 border-b border-admin-border flex items-center gap-3 bg-white">
          <Search className="text-admin-muted" size={20} />
          <input 
            placeholder="Search users by name or email..." 
            className="bg-transparent border-none focus:outline-none text-admin-text w-full placeholder:text-admin-muted"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-header text-admin-text text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Plan & Limits</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border text-sm text-admin-text">
              {filteredUsers.map(user => (
                <tr key={user.id} className="odd:bg-white even:bg-admin-rowEven hover:bg-admin-hover transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePhotoUrl || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full border border-admin-border object-cover" />
                      <div>
                        <p className="font-bold text-admin-text">{user.name}</p>
                        <p className="text-xs text-admin-secondary">{user.email}</p>
                        {user.farmId && <p className="text-[9px] font-mono text-agri-secondary mt-1">Farm ID: {user.farmId}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-admin-text">
                            <span className="text-agri-secondary">{user.subscriptionTier || 'Free'}</span>
                        </div>
                        <div className="flex gap-3 mt-1">
                            <div className="flex items-center gap-1 text-[10px] text-admin-secondary">
                                <FileText size={10} /> {user.articleLimit === 'UNLIMITED' ? '∞' : (Number(user.articleLimit) || 0) + (user.adminArticleLimitAdjustment || 0)}
                            </div>
                            <div className="flex items-center gap-1 text-[10px] text-admin-secondary">
                                <PenTool size={10} /> {user.blogLimit === 'UNLIMITED' ? '∞' : (Number(user.blogLimit) || 0) + (user.adminBlogLimitAdjustment || 0)}
                            </div>
                        </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-bold border w-fit ${
                        user.role === 'SUPER_ADMIN' ? 'border-purple-200 text-purple-700 bg-purple-50' :
                        user.role === 'ADMIN' ? 'border-blue-200 text-blue-700 bg-blue-50' :
                        user.role === 'EDITORIAL_MEMBER' ? 'border-indigo-200 text-indigo-700 bg-indigo-50' :
                        user.role === 'EDITOR' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                        'border-gray-200 text-gray-600 bg-gray-50'
                        }`}>
                        {user.role === 'EDITORIAL_MEMBER' ? 'REVIEWER' : user.role}
                        </span>
                        {user.role === 'EDITORIAL_MEMBER' && user.editorialRole && (
                            <span className="text-[9px] font-black uppercase text-admin-secondary tracking-wider">{user.editorialRole}</span>
                        )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-xs font-bold ${user.status === 'BLOCKED' ? 'text-red-600' : 'text-green-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'BLOCKED' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-admin-secondary font-medium">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openLimitModal(user)} 
                        className="p-2 hover:bg-agri-secondary/10 rounded-lg text-agri-secondary transition-all shadow-sm" 
                        title="Manage Limits"
                      >
                        <Activity size={16} />
                      </button>
                      {isSuperAdmin && (
                        <>
                          <button onClick={() => handleResetPassword(user)} className="p-2 hover:bg-yellow-50 rounded-lg text-admin-muted hover:text-yellow-600 transition-colors" title="Reset Password">
                            <Lock size={16} />
                          </button>
                          <button onClick={() => handleToggleBlock(user)} className="p-2 hover:bg-white border border-transparent hover:border-admin-border rounded-lg text-admin-muted hover:text-admin-text transition-all shadow-sm" title={user.status === 'BLOCKED' ? "Unblock" : "Block"}>
                            {user.status === 'BLOCKED' ? <Unlock size={16} /> : <Lock size={16} />}
                          </button>
                          <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-admin-muted hover:text-blue-600 transition-colors">
                            <Edit size={16} />
                          </button>
                          <button onClick={(e) => handleDelete(user.id, e)} className="p-2 hover:bg-red-50 rounded-lg text-admin-muted hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Limit Management Modal */}
      {isLimitModalOpen && selectedUserForLimits && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-admin-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-admin-border flex justify-between items-center bg-admin-header">
              <div>
                <h3 className="text-xl font-bold text-admin-text">Manage User Limits</h3>
                <p className="text-xs text-admin-secondary mt-1">{selectedUserForLimits.name} ({selectedUserForLimits.email})</p>
              </div>
              <button onClick={() => setIsLimitModalOpen(false)}><X className="text-admin-muted hover:text-admin-text transition-colors" /></button>
            </div>
            
            <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              {/* Plan Info */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Current Plan Details</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-agri-primary">{selectedUserForLimits.subscriptionTier || 'Free Tier'}</span>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-stone-400 uppercase">Plan Article</p>
                      <p className="text-xs font-black">{selectedUserForLimits.articleLimit === 'UNLIMITED' ? '∞' : selectedUserForLimits.articleLimit || 0}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold text-stone-400 uppercase">Plan Blog</p>
                      <p className="text-xs font-black">{selectedUserForLimits.blogLimit === 'UNLIMITED' ? '∞' : selectedUserForLimits.blogLimit || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gift Plan Section */}
              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <label className="block text-xs font-bold text-purple-800 mb-2 uppercase tracking-wide flex items-center gap-2">
                  <Gift size={14} /> Gift Subscription Plan
                </label>
                <div className="flex gap-2">
                  <select 
                    className="flex-1 bg-white border border-purple-200 rounded-lg p-2 text-sm text-admin-text focus:border-purple-500 outline-none"
                    value={selectedGiftPlanId}
                    onChange={e => setSelectedGiftPlanId(e.target.value)}
                  >
                    <option value="">Select a plan to gift...</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.durationMonths} Months)</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleGiftPlan}
                    disabled={!selectedGiftPlanId || isSavingLimits}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gift Plan
                  </button>
                </div>
                <p className="text-[10px] text-purple-600 mt-2 italic">
                  This will immediately update the user's subscription tier, limits, and expiry date.
                </p>
              </div>

              {/* Adjustments */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-admin-secondary mb-2 uppercase tracking-wide flex items-center gap-2">
                      <FileText size={14} /> Extra Articles
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        className="w-full bg-white border border-admin-border rounded-lg p-2 text-center font-bold text-admin-text focus:border-agri-secondary outline-none"
                        value={limitForm.articleAdjustment}
                        onChange={e => setLimitForm(prev => ({ ...prev, articleAdjustment: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-admin-secondary mb-2 uppercase tracking-wide flex items-center gap-2">
                      <PenTool size={14} /> Extra Blogs
                    </label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        className="w-full bg-white border border-admin-border rounded-lg p-2 text-center font-bold text-admin-text focus:border-agri-secondary outline-none"
                        value={limitForm.blogAdjustment}
                        onChange={e => setLimitForm(prev => ({ ...prev, blogAdjustment: parseInt(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-admin-secondary mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Globe size={14} /> Account Type
                  </label>
                  <select 
                    className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary outline-none font-bold text-sm"
                    value={limitForm.userType}
                    onChange={e => setLimitForm(prev => ({ ...prev, userType: e.target.value as any }))}
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="INSTITUTE">Institute</option>
                    <option value="ORGANISATION">Organisation</option>
                    <option value="FARMER">Farmer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-admin-secondary mb-2 uppercase tracking-wide flex items-center gap-2">
                    <Clock size={14} /> Expiry Override
                  </label>
                  <input 
                    type="date"
                    className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary outline-none font-bold text-sm"
                    value={limitForm.adminExpiryOverride}
                    onChange={e => setLimitForm(prev => ({ ...prev, adminExpiryOverride: e.target.value }))}
                  />
                  <p className="text-[10px] text-admin-muted mt-1 italic">Leave empty to use plan default expiry</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-admin-secondary mb-3 uppercase tracking-wide flex items-center gap-2">
                    <Shield size={14} /> Admin Enabled Tools
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-stone-50 p-4 rounded-xl border border-stone-100">
                    {allTools.map(tool => (
                      <label key={tool.id} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox"
                          className="rounded border-stone-300 text-agri-secondary focus:ring-agri-secondary"
                          checked={limitForm.adminEnabledTools.includes(tool.id)}
                          onChange={e => {
                            const tools = e.target.checked 
                              ? [...limitForm.adminEnabledTools, tool.id]
                              : limitForm.adminEnabledTools.filter(id => id !== tool.id);
                            setLimitForm(prev => ({ ...prev, adminEnabledTools: tools }));
                          }}
                        />
                        <span className="text-[10px] font-bold text-stone-600 group-hover:text-agri-primary transition-colors">{tool.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">Adjustment Notes</label>
                  <textarea 
                    className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary outline-none h-20 resize-none text-sm"
                    placeholder="Reason for adjustment..."
                    value={limitForm.notes}
                    onChange={e => setLimitForm(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-admin-border flex justify-end gap-3 bg-admin-bg">
              <button 
                onClick={() => setIsLimitModalOpen(false)} 
                className="px-4 py-2 text-admin-secondary hover:text-admin-text font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveLimits} 
                disabled={isSavingLimits}
                className="bg-agri-secondary hover:bg-agri-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all text-sm flex items-center gap-2"
              >
                {isSavingLimits ? 'Saving...' : 'Save Adjustments'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal (Super Admin Only) */}
      {isModalOpen && isSuperAdmin && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-admin-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-admin-border flex justify-between items-center bg-admin-header rounded-t-2xl">
              <h3 className="text-xl font-bold text-admin-text">{editingUser?.id ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-admin-muted hover:text-admin-text transition-colors" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">Full Name</label>
                  <input 
                    className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary outline-none transition-all"
                    value={editingUser?.name || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">Role</label>
                  <select 
                    className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary outline-none transition-all"
                    value={editingUser?.role || 'USER'}
                    onChange={e => setEditingUser(prev => ({ ...prev, role: e.target.value as Role }))}
                  >
                    <option value="USER">User</option>
                    <option value="EDITORIAL_MEMBER">Editorial Member</option>
                    <option value="EDITOR">Editor (Legacy)</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              {/* Editorial Sub-Role Selection */}
              {editingUser?.role === 'EDITORIAL_MEMBER' && (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                      <label className="block text-xs font-bold text-indigo-800 mb-1 uppercase tracking-wide flex items-center gap-2">
                          <BookOpen size={14}/> Editorial Designation
                      </label>
                      <select 
                        className="w-full bg-white border border-indigo-200 rounded-lg p-3 text-admin-text focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        value={editingUser?.editorialRole || 'Reviewer'}
                        onChange={e => setEditingUser(prev => ({ ...prev, editorialRole: e.target.value as EditorialRole }))}
                      >
                        <option value="Reviewer">Reviewer</option>
                        <option value="Section Editor">Section Editor</option>
                        <option value="Editorial Board Member">Editorial Board Member</option>
                        <option value="Advisory Member">Advisory Member</option>
                      </select>
                  </div>
              )}

              <div>
                <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">Email</label>
                <input 
                  className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary outline-none transition-all"
                  value={editingUser?.email || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">Country (ISO)</label>
                    <input 
                        className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary outline-none transition-all"
                        value={editingUser?.country || ''}
                        onChange={e => setEditingUser(prev => ({ ...prev, country: e.target.value }))}
                        placeholder="IN, US, etc."
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">Mobile</label>
                    <input 
                        className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary outline-none transition-all"
                        value={editingUser?.mobileNumber || ''}
                        onChange={e => setEditingUser(prev => ({ ...prev, mobileNumber: e.target.value }))}
                    />
                  </div>
              </div>
            </div>
            <div className="p-6 border-t border-admin-border flex justify-end gap-3 bg-admin-bg rounded-b-2xl">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-admin-secondary hover:text-admin-text font-bold text-sm">Cancel</button>
              <button onClick={handleSaveUser} className="bg-agri-secondary hover:bg-agri-primary text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all text-sm">Save User</button>
            </div>
          </div>
        </div>
      )}

      {isResetPasswordModalOpen && selectedUserForReset && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-admin-border flex justify-between items-center">
              <h2 className="text-xl font-bold text-admin-text flex items-center gap-2">
                <Lock className="text-yellow-500" /> Reset Password
              </h2>
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="text-admin-muted hover:text-admin-text transition-colors">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-admin-secondary">
                Resetting password for <span className="font-bold text-admin-text">{selectedUserForReset.name}</span> ({selectedUserForReset.email}).
              </p>
              <div>
                <label className="block text-xs font-bold text-admin-secondary mb-1 uppercase tracking-wide">New Password</label>
                <input 
                  type="password"
                  className="w-full bg-white border border-admin-border rounded-lg p-3 text-admin-text focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
            </div>
            <div className="p-6 border-t border-admin-border flex justify-end gap-3 bg-admin-bg rounded-b-2xl">
              <button onClick={() => setIsResetPasswordModalOpen(false)} className="px-4 py-2 text-admin-secondary hover:text-admin-text font-bold text-sm">Cancel</button>
              <button 
                onClick={submitResetPassword} 
                disabled={isResettingPassword || !newPassword}
                className="bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 text-white px-6 py-2 rounded-xl font-bold shadow-lg transition-all text-sm"
              >
                {isResettingPassword ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
