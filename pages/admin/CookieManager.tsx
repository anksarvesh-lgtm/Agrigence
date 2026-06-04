import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { CookieSettings, CookieCategory, CookieScript, CookiePreferences } from '../../types';
import { ShieldCheck, Plus, Edit2, Trash2, Save, Activity, Code, Settings, History } from 'lucide-react';

const CookieManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'categories' | 'scripts' | 'logs'>('settings');
  const [settings, setSettings] = useState<CookieSettings | null>(null);
  const [logs, setLogs] = useState<CookiePreferences[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Script Modal
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<CookieScript | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, logsData] = await Promise.all([
        mockBackend.getCookieSettings(),
        mockBackend.getCookieConsentLogs()
      ]);
      setSettings(settingsData);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to load cookie data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;
    try {
      await mockBackend.updateCookieSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error("Failed to save settings", error);
      alert('Failed to save settings.');
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (!settings) return;
    const updatedCategories = settings.categories.map(c => 
      c.id === categoryId && !c.isEssential ? { ...c, isEnabled: !c.isEnabled } : c
    );
    setSettings({ ...settings, categories: updatedCategories });
  };

  const handleSaveScript = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;
    
    const formData = new FormData(e.currentTarget);
    const newScript: CookieScript = {
      id: editingScript?.id || `script_${Math.random().toString(36).substring(2, 9)}`,
      categoryId: formData.get('categoryId') as string,
      name: formData.get('name') as string,
      scriptContent: formData.get('scriptContent') as string,
      isSrc: formData.get('isSrc') === 'on'
    };

    let updatedScripts = [...settings.scripts];
    if (editingScript) {
      updatedScripts = updatedScripts.map(s => s.id === editingScript.id ? newScript : s);
    } else {
      updatedScripts.push(newScript);
    }

    setSettings({ ...settings, scripts: updatedScripts });
    setIsScriptModalOpen(false);
  };

  const handleDeleteScript = (id: string) => {
    if (!settings) return;
    if (window.confirm('Are you sure you want to delete this script?')) {
      setSettings({ ...settings, scripts: settings.scripts.filter(s => s.id !== id) });
    }
  };

  if (isLoading || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-green"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-agri-green" />
            Cookie Consent Manager
          </h1>
          <p className="text-gray-500 mt-2">Manage cookie policies, categories, and tracking scripts.</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          className="bg-agri-green text-white px-6 py-2 rounded-lg hover:bg-agri-dark transition-colors flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Save className="h-5 w-5" />
          Save All Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col md:flex-row space-y-1 md:space-y-0 md:space-x-1 bg-white p-1 rounded-xl shadow-sm mb-6 border border-gray-100">
        {[
          { id: 'settings', label: 'General Settings', icon: Settings },
          { id: 'categories', label: 'Categories', icon: Activity },
          { id: 'scripts', label: 'Tracking Scripts', icon: Code },
          { id: 'logs', label: 'Consent Logs', icon: History }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id 
                ? 'bg-agri-green text-white shadow-md' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Default Consent Mode</label>
                <select 
                  value={settings.defaultMode}
                  onChange={(e) => setSettings({...settings, defaultMode: e.target.value as any})}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="ASK">Ask User (Strict)</option>
                  <option value="ACCEPT_ALL">Accept All (Lenient)</option>
                  <option value="REJECT_ALL">Reject All (Privacy First)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">What happens before the user makes a choice.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consent Expiry (Days)</label>
                <input 
                  type="number" 
                  value={settings.expiryDays}
                  onChange={(e) => setSettings({...settings, expiryDays: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">How long before asking for consent again.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consent Version</label>
                <input 
                  type="number" 
                  value={settings.consentVersion}
                  onChange={(e) => setSettings({...settings, consentVersion: Number(e.target.value)})}
                  className="w-full p-2 border rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">Increment this to force re-consent for all users.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Policy URL</label>
                <input 
                  type="text" 
                  value={settings.privacyPolicyUrl}
                  onChange={(e) => setSettings({...settings, privacyPolicyUrl: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cookie Policy URL</label>
                <input 
                  type="text" 
                  value={settings.cookiePolicyUrl}
                  onChange={(e) => setSettings({...settings, cookiePolicyUrl: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="space-y-4">
              {settings.categories.map(category => (
                <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div>
                    <h3 className="font-bold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-600">{category.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {category.isEssential ? (
                      <span className="text-xs font-bold text-agri-green uppercase tracking-wider bg-green-100 px-2 py-1 rounded">Always Enabled</span>
                    ) : (
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={category.isEnabled}
                          onChange={() => handleCategoryToggle(category.id)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agri-green"></div>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => { setEditingScript(null); setIsScriptModalOpen(true); }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Script
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold rounded-tl-lg">Name</th>
                    <th className="p-4 font-semibold">Category</th>
                    <th className="p-4 font-semibold">Type</th>
                    <th className="p-4 font-semibold text-right rounded-tr-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {settings.scripts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No scripts added yet.</td>
                    </tr>
                  ) : (
                    settings.scripts.map(script => (
                      <tr key={script.id} className="hover:bg-gray-50">
                        <td className="p-4 font-medium text-gray-900">{script.name}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                            {settings.categories.find(c => c.id === script.categoryId)?.name || script.categoryId}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {script.isSrc ? 'External URL (src)' : 'Inline Script'}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => { setEditingScript(script); setIsScriptModalOpen(true); }}
                            className="p-2 text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteScript(script.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-semibold rounded-tl-lg">Date</th>
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Version</th>
                    <th className="p-4 font-semibold">Consent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-gray-500">No consent logs found.</td>
                    </tr>
                  ) : (
                    logs.map((log, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-4 text-sm text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                        <td className="p-4 text-sm font-mono text-gray-500">{log.userId || 'Guest'}</td>
                        <td className="p-4 text-sm text-gray-600">v{log.consentVersion}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${log.analytics ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Analytics</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${log.marketing ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Marketing</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${log.preferences ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>Prefs</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Script Modal */}
      {isScriptModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6">
            <h2 className="text-2xl font-bold mb-6">{editingScript ? 'Edit Script' : 'Add Script'}</h2>
            <form onSubmit={handleSaveScript}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Script Name</label>
                  <input name="name" defaultValue={editingScript?.name} required className="w-full p-2 border rounded-lg" placeholder="e.g., Google Analytics" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="categoryId" defaultValue={editingScript?.categoryId || 'analytics'} className="w-full p-2 border rounded-lg">
                    {settings.categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" name="isSrc" id="isSrc" defaultChecked={editingScript?.isSrc} className="w-4 h-4 text-agri-green rounded" />
                  <label htmlFor="isSrc" className="text-sm font-medium text-gray-700">External URL (src attribute)</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Script Content / URL</label>
                  <textarea 
                    name="scriptContent" 
                    defaultValue={editingScript?.scriptContent} 
                    required 
                    rows={5}
                    className="w-full p-2 border rounded-lg font-mono text-sm" 
                    placeholder="Enter script URL or inline JS code..."
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsScriptModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Script</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookieManager;
