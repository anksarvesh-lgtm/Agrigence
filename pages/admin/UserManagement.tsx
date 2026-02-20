
import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { User, Role, EditorialRole } from '../../types';
import { Search, Edit, Trash2, Shield, Lock, Unlock, UserPlus, X, Globe, Smartphone, BookOpen } from 'lucide-react';
import { useConfirm } from '../../components/ContextualConfirm';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const { confirm } = useConfirm();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsers([...(await mockBackend.getUsers())]);
  };

  const handleSaveUser = async () => {
    if (!editingUser?.email || !editingUser?.name) return;

    if (editingUser.id) {
      await mockBackend.updateUser(editingUser as User);
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
    await mockBackend.updateUser({ ...user, status: newStatus });
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-admin-text">User Management</h1>
        <button 
          onClick={() => { setEditingUser({}); setIsModalOpen(true); }}
          className="bg-agri-secondary hover:bg-agri-primary text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all font-bold text-sm shadow-md"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="bg-admin-panel border border-admin-border rounded-2xl overflow-hidden shadow-admin">
        <div className="p-4 border-b border-admin-border flex items-center gap-3 bg-white">
          <Search className="text-admin-muted" size={20} />
          <input 
            placeholder="Search users..." 
            className="bg-transparent border-none focus:outline-none text-admin-text w-full placeholder:text-admin-muted"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-admin-header text-admin-text text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Location & Contact</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border text-sm text-admin-text">
              {users.map(user => (
                <tr key={user.id} className="odd:bg-white even:bg-admin-rowEven hover:bg-admin-hover transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={user.profilePhotoUrl || user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full border border-admin-border object-cover" />
                      <div>
                        <p className="font-bold text-admin-text">{user.name}</p>
                        <p className="text-xs text-admin-secondary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="space-y-1">
                        {user.country && (
                            <div className="flex items-center gap-2 text-xs text-admin-secondary font-medium">
                                <Globe size={12} className="text-admin-muted" /> {user.country}
                            </div>
                        )}
                        {user.mobileNumber && (
                            <div className="flex items-center gap-2 text-xs text-admin-secondary font-medium">
                                <Smartphone size={12} className="text-admin-muted" /> {user.mobileNumber}
                            </div>
                        )}
                        {!user.country && !user.mobileNumber && <span className="text-admin-muted text-xs italic">Not Provided</span>}
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
                      <button onClick={() => handleToggleBlock(user)} className="p-2 hover:bg-white border border-transparent hover:border-admin-border rounded-lg text-admin-muted hover:text-admin-text transition-all shadow-sm" title={user.status === 'BLOCKED' ? "Unblock" : "Block"}>
                        {user.status === 'BLOCKED' ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 hover:bg-blue-50 rounded-lg text-admin-muted hover:text-blue-600 transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => handleDelete(user.id, e)} className="p-2 hover:bg-red-50 rounded-lg text-admin-muted hover:text-red-600 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
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
    </div>
  );
};

export default UserManagement;
