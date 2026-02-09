import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { User, Role } from '../../types';
import { Search, Edit, Trash2, Shield, Lock, Unlock, UserPlus, X } from 'lucide-react';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsers([...mockBackend.getUsers()]);
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

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
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
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <button 
          onClick={() => { setEditingUser({}); setIsModalOpen(true); }}
          className="bg-admin-leaf hover:bg-admin-crop text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
        >
          <UserPlus size={18} /> Add User
        </button>
      </div>

      <div className="bg-admin-glass backdrop-blur-md border border-admin-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-admin-border flex items-center gap-3">
          <Search className="text-admin-muted" size={20} />
          <input 
            placeholder="Search users..." 
            className="bg-transparent border-none focus:outline-none text-white w-full"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-admin-muted text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">User</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Last Login</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-admin-border text-sm">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}`} className="w-10 h-10 rounded-full bg-admin-bg" />
                      <div>
                        <p className="font-bold text-white">{user.name}</p>
                        <p className="text-xs text-admin-muted">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${
                      user.role === 'SUPER_ADMIN' ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' :
                      user.role === 'ADMIN' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                      user.role === 'EDITOR' ? 'border-yellow-500/50 text-yellow-400 bg-yellow-500/10' :
                      'border-gray-500/50 text-gray-400 bg-gray-500/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`flex items-center gap-1 text-xs font-bold ${user.status === 'BLOCKED' ? 'text-red-400' : 'text-green-400'}`}>
                      <span className={`w-2 h-2 rounded-full ${user.status === 'BLOCKED' ? 'bg-red-400' : 'bg-green-400'}`}></span>
                      {user.status || 'ACTIVE'}
                    </span>
                  </td>
                  <td className="p-4 text-admin-muted">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleToggleBlock(user)} className="p-2 hover:bg-white/10 rounded-lg text-admin-muted hover:text-white" title={user.status === 'BLOCKED' ? "Unblock" : "Block"}>
                        {user.status === 'BLOCKED' ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 hover:bg-white/10 rounded-lg text-admin-muted hover:text-blue-400">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2 hover:bg-white/10 rounded-lg text-admin-muted hover:text-red-400">
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C2A22] border border-admin-border rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-6 border-b border-admin-border flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{editingUser?.id ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="text-admin-muted hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-admin-muted mb-1">Full Name</label>
                  <input 
                    className="w-full bg-black/20 border border-admin-border rounded-lg p-2 text-white focus:border-admin-leaf outline-none"
                    value={editingUser?.name || ''}
                    onChange={e => setEditingUser(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-admin-muted mb-1">Role</label>
                  <select 
                    className="w-full bg-black/20 border border-admin-border rounded-lg p-2 text-white focus:border-admin-leaf outline-none"
                    value={editingUser?.role || 'USER'}
                    onChange={e => setEditingUser(prev => ({ ...prev, role: e.target.value as Role }))}
                  >
                    <option value="USER">User</option>
                    <option value="EDITOR">Editor</option>
                    <option value="ADMIN">Admin</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-admin-muted mb-1">Email</label>
                <input 
                  className="w-full bg-black/20 border border-admin-border rounded-lg p-2 text-white focus:border-admin-leaf outline-none"
                  value={editingUser?.email || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-admin-muted mb-1">Phone</label>
                <input 
                  className="w-full bg-black/20 border border-admin-border rounded-lg p-2 text-white focus:border-admin-leaf outline-none"
                  value={editingUser?.phone || ''}
                  onChange={e => setEditingUser(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>
            <div className="p-6 border-t border-admin-border flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-admin-muted hover:text-white">Cancel</button>
              <button onClick={handleSaveUser} className="bg-admin-leaf hover:bg-admin-crop text-white px-6 py-2 rounded-xl font-bold">Save User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
