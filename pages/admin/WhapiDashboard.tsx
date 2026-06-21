import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Settings, Save, RefreshCw, Send, MessageSquare, Key, Link as LinkIcon, Users, FileText, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function WhapiDashboard() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'templates' | 'groups' | 'contacts' | 'mappings' | 'logs'>('tokens');

  // Generic Data Fetcher
  const [data, setData] = useState<any>({ tokens: [], templates: [], groups: [], contacts: [], mappings: [], logs: [], usage: [] });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tokens, templates, groups, contacts, mappings, logs, usage] = await Promise.all([
        axios.get('/api/whatsapp/tokens').then(res => res.data),
        axios.get('/api/whatsapp/templates').then(res => res.data),
        axios.get('/api/whatsapp/groups').then(res => res.data),
        axios.get('/api/whatsapp/contacts').then(res => res.data),
        axios.get('/api/whatsapp/mappings').then(res => res.data),
        axios.get('/api/whatsapp/logs').then(res => res.data),
        axios.get('/api/whatsapp/usage').then(res => res.data)
      ]);
      setData({ tokens, templates, groups, contacts, mappings, logs, usage });
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      <div className="flex justify-between items-center mb-8">
         <h1 className="text-3xl font-black text-stone-900 tracking-tight flex items-center gap-3">
           <MessageSquare size={32} className="text-[#36B37E]" /> WhatsApp Engine <span className="text-sm bg-[#36B37E]/20 text-[#36B37E] px-3 py-1 rounded-full font-bold">Whapi.Cloud</span>
         </h1>
         <button onClick={fetchData} className="p-3 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 shadow-sm"><RefreshCw size={20} className={loading ? "animate-spin" : ""} /></button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar */}
        <div className="col-span-12 md:col-span-3 lg:col-span-2 flex flex-row md:flex-col gap-2 overflow-x-auto border-r border-stone-200 pr-4 pb-4">
          <button onClick={() => setActiveTab('tokens')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'tokens' ? 'bg-[#36B37E] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}><Key size={18}/> Tokens & Limits</button>
          <button onClick={() => setActiveTab('templates')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'templates' ? 'bg-[#36B37E] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}><FileText size={18}/> Templates</button>
          <button onClick={() => setActiveTab('groups')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'groups' ? 'bg-[#36B37E] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}><Users size={18}/> Contact Groups</button>
          <button onClick={() => setActiveTab('contacts')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'contacts' ? 'bg-[#36B37E] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}><Users size={18}/> Contacts</button>
          <button onClick={() => setActiveTab('mappings')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'mappings' ? 'bg-[#36B37E] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}><LinkIcon size={18}/> Event Router</button>
          <button onClick={() => setActiveTab('logs')} className={`flex items-center gap-3 p-3 rounded-xl font-bold transition-all ${activeTab === 'logs' ? 'bg-[#36B37E] text-white shadow-md' : 'hover:bg-stone-100 text-stone-600'}`}><Settings size={18}/> System Logs</button>
        </div>

        {/* Content Area */}
        <div className="col-span-12 md:col-span-9 lg:col-span-10">
           {activeTab === 'tokens' && <TokensTab data={data} refresh={fetchData} />}
           {activeTab === 'templates' && <TemplatesTab data={data} refresh={fetchData} />}
           {activeTab === 'groups' && <GroupsTab data={data} refresh={fetchData} />}
           {activeTab === 'contacts' && <ContactsTab data={data} refresh={fetchData} />}
           {activeTab === 'mappings' && <MappingsTab data={data} refresh={fetchData} />}
           {activeTab === 'logs' && <LogsTab data={data} refresh={fetchData} />}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// Component Tabs
// -----------------------------------------------------

function TokensTab({ data, refresh }: any) {
  const [form, setForm] = useState({ name: '', token: '', isActive: true });
  
  const handleSave = async () => {
    if (!form.token || !form.name) return;
    await axios.post('/api/whatsapp/tokens', form);
    refresh();
    setForm({ name: '', token: '', isActive: true });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
         <h2 className="text-xl font-bold mb-4">Add Whapi.Cloud Token</h2>
         <div className="grid grid-cols-2 gap-4">
           <input placeholder="Token Name (e.g. Master Token 1)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-xl p-3" />
           <input placeholder="Bearer Token" value={form.token} onChange={e => setForm({...form, token: e.target.value})} className="border rounded-xl p-3" />
         </div>
         <button onClick={handleSave} className="mt-4 bg-[#36B37E] text-white px-6 py-2 rounded-xl font-bold">Add Token</button>
       </div>
       
       <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold text-xs uppercase tracking-widest">
               <tr><th className="p-4">Name</th><th className="p-4">Active</th><th className="p-4">Today's Usage (Max 150)</th><th className="p-4">Actions</th></tr>
             </thead>
             <tbody className="divide-y divide-stone-100">
               {data.tokens.map((t: any) => {
                 const usages = data.usage.filter((u: any) => u.tokenId === t.id && u.date === todayStr);
                 const sum = usages.reduce((acc: number, curr: any) => acc + curr.count, 0);
                 return (
                   <tr key={t.id}>
                     <td className="p-4 font-bold">{t.name}</td>
                     <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${t.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                     </td>
                     <td className="p-4 font-mono font-bold text-lg">
                       <span className={sum >= 150 ? 'text-red-500' : 'text-emerald-600'}>{sum}</span> / 150
                     </td>
                     <td className="p-4 text-xs font-bold text-red-500 cursor-pointer" onClick={() => axios.delete('/api/whatsapp/tokens/'+t.id).then(refresh)}>Delete</td>
                   </tr>
                 )
               })}
             </tbody>
          </table>
       </div>
    </div>
  )
}

function TemplatesTab({ data, refresh }: any) {
  const [form, setForm] = useState({ name: '', content: '' });
  
  const handleSave = async () => {
    if (!form.name || !form.content) return;
    await axios.post('/api/whatsapp/templates', form);
    refresh();
    setForm({ name: '', content: '' });
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
         <h2 className="text-xl font-bold mb-4">Create Template</h2>
         <p className="text-sm text-stone-500 mb-4">Use {'{{variable}}'} to inject dynamic data from events (e.g. {'{{name}}'}, {'{{status}}'}).</p>
         <input placeholder="Template Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-xl p-3 w-full mb-4" />
         <textarea placeholder="Template Body" value={form.content} onChange={e => setForm({...form, content: e.target.value})} className="border rounded-xl p-3 w-full h-32 mb-4" />
         <button onClick={handleSave} className="bg-[#36B37E] text-white px-6 py-2 rounded-xl font-bold">Save Template</button>
       </div>
       
       <div className="grid grid-cols-2 gap-4">
          {data.templates.map((t: any) => (
             <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                <div className="flex justify-between">
                   <h3 className="font-bold text-lg text-stone-900">{t.name}</h3>
                   <button onClick={() => axios.delete('/api/whatsapp/templates/'+t.id).then(refresh)} className="text-red-500 text-xs font-bold">Delete</button>
                </div>
                <div className="mt-4 p-4 bg-stone-50 rounded-xl font-mono text-xs whitespace-pre-wrap">
                   {t.content}
                </div>
             </div>
          ))}
       </div>
    </div>
  )
}

function GroupsTab({ data, refresh }: any) {
  const [name, setName] = useState('');
  
  const handleSave = async () => {
    if (!name) return;
    await axios.post('/api/whatsapp/groups', { name });
    refresh(); setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <input placeholder="Group Name" value={name} onChange={e => setName(e.target.value)} className="border rounded-xl p-3 flex-1" />
        <button onClick={handleSave} className="bg-[#36B37E] text-white px-6 py-2 rounded-xl font-bold">Add Group</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {data.groups.map((g: any) => (
          <div key={g.id} className="bg-white p-4 rounded-xl border border-stone-200 flex justify-between items-center shadow-sm">
             <span className="font-bold text-stone-900">{g.name}</span>
             <button onClick={() => axios.delete('/api/whatsapp/groups/'+g.id).then(refresh)} className="text-red-400 text-xs font-bold focus:outline-none">Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContactsTab({ data, refresh }: any) {
  const [form, setForm] = useState({ name: '', phone: '', groupId: '' });
  const [syncing, setSyncing] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSave = async () => {
    if (!form.name || !form.phone || !form.groupId) return;
    await axios.post('/api/whatsapp/contacts', form);
    refresh(); setForm({ name: '', phone: '', groupId: '' });
  };

  const handleSyncUsers = async () => {
    if (!confirm('This will fetch all users from the main database and add them to the "All Users" group. Continue?')) return;
    setSyncing(true);
    try {
      const res = await axios.post('/api/whatsapp/sync-users');
      alert(`Successfully synced ${res.data.count} new contacts from ${res.data.totalProcessed} users.`);
      refresh();
    } catch (e: any) {
      alert('Sync failed: ' + (e.response?.data?.error || e.message));
    }
    setSyncing(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!form.groupId) {
      alert('Please select a Group from the dropdown below first before importing.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setImporting(true);
    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const wsname = workbook.SheetNames[0];
        const ws = workbook.Sheets[wsname];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });
        
        const contactsToImport: any[] = [];
        // Assuming row 0 is header. Trying to find name and phone cols.
        let nameIdx = -1;
        let phoneIdx = -1;

        if (rows.length > 0) {
          const header = rows[0].map((h: any) => String(h).toLowerCase());
          nameIdx = header.findIndex((h: string) => h.includes('name'));
          phoneIdx = header.findIndex((h: string) => h.includes('phone') || h.includes('contact') || h.includes('mobile') || h.includes('number'));
        }

        // If no headers found, fallback to 0 and 1
        if (nameIdx === -1) nameIdx = 0;
        if (phoneIdx === -1) phoneIdx = 1;

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (row.length === 0) continue;
          
          const name = row[nameIdx] ? String(row[nameIdx]).trim() : 'Unknown';
          const phone = row[phoneIdx] ? String(row[phoneIdx]).trim().replace(/\D/g, '') : '';
          
          if (phone) {
             contactsToImport.push({ name, phone, groupId: form.groupId });
          }
        }

        if (contactsToImport.length > 0) {
           await axios.post('/api/whatsapp/contacts/import', { contacts: contactsToImport });
           alert(`Imported ${contactsToImport.length} contacts successfully!`);
           refresh();
        } else {
           alert("No valid contacts found in the Excel file.");
        }
        setImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error(error);
      alert('Failed to parse Excel file.');
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
         <div className="flex justify-between items-center mb-4">
           <h2 className="text-xl font-bold">Manage Contacts</h2>
           <div className="flex gap-2">
             <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             <button 
               onClick={() => {
                 if (!form.groupId) {
                   alert('Please select a group below before importing.');
                   return;
                 }
                 fileInputRef.current?.click();
               }}
               disabled={importing || syncing}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${importing ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'}`}
             >
               <Upload size={16} />
               {importing ? 'Importing...' : 'Import from Excel'}
             </button>
             <button 
               onClick={handleSyncUsers} 
               disabled={syncing || importing}
               className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${syncing ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:bg-black shadow-sm'}`}
             >
               <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
               {syncing ? 'Syncing...' : 'Sync from Users Data'}
             </button>
           </div>
         </div>

         <div className="flex gap-4 items-end border-t border-stone-100 pt-4">
           <div className="flex-1">
              <label className="text-xs font-bold text-stone-500 block mb-1">Group</label>
              <select value={form.groupId} onChange={e => setForm({...form, groupId: e.target.value})} className="border rounded-xl p-2 w-full">
                <option value="">Select Group...</option>
                {data.groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
           </div>
           <div className="flex-1"><label className="text-xs font-bold text-stone-500 block mb-1">Name</label><input placeholder="Or add manually" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="border rounded-xl p-2 w-full" /></div>
           <div className="flex-1"><label className="text-xs font-bold text-stone-500 block mb-1">Phone (+Code)</label><input placeholder="ex: 919876543210" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="border rounded-xl p-2 w-full" /></div>
           <button onClick={handleSave} className="bg-[#36B37E] text-white px-6 py-2 rounded-xl font-bold h-[42px]">Add</button>
         </div>
       </div>

       <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <table className="w-full text-left">
             <thead className="bg-stone-50"><tr><th className="p-4 text-xs font-bold text-stone-500">Name</th><th className="p-4 text-xs font-bold text-stone-500">Phone</th><th className="p-4 text-xs font-bold text-stone-500">Group</th><th className="p-4 text-xs font-bold text-stone-500">Action</th></tr></thead>
             <tbody className="divide-y divide-stone-100">
               {data.contacts.map((c: any) => (
                 <tr key={c.id}>
                   <td className="p-4 font-bold text-stone-900">{c.name}</td>
                   <td className="p-4 font-mono">{c.phone}</td>
                   <td className="p-4"><span className="bg-stone-100 px-2 py-1 rounded-lg text-xs font-bold">{data.groups.find((g: any) => g.id === c.groupId)?.name}</span></td>
                   <td className="p-4"><button onClick={() => axios.delete('/api/whatsapp/contacts/'+c.id).then(refresh)} className="text-red-400 text-xs font-bold">Remove</button></td>
                 </tr>
               ))}
             </tbody>
          </table>
       </div>
    </div>
  )
}

function MappingsTab({ data, refresh }: any) {
  const [form, setForm] = useState({ eventId: '', templateId: '', groupId: '' });
  
  const handleSave = async () => {
    if (!form.eventId || !form.templateId || !form.groupId) return;
    await axios.post('/api/whatsapp/mappings', form);
    refresh(); setForm({ eventId: '', templateId: '', groupId: '' });
  };

  const sysEvents = ['subscription_paid', 'manuscript_submitted', 'manuscript_reviewed', 'custom_demo'];

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
         <h2 className="text-xl font-bold mb-4">Event Trigger Router</h2>
         <div className="flex gap-4 items-end">
           <div className="flex-1">
              <label className="text-xs font-bold text-stone-500 block mb-1">System Event</label>
              <select value={form.eventId} onChange={e => setForm({...form, eventId: e.target.value})} className="border rounded-xl p-2 w-full">
                <option value="">Select Event...</option>
                {sysEvents.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
           </div>
           <div className="flex-1">
              <label className="text-xs font-bold text-stone-500 block mb-1">Trigger Template</label>
              <select value={form.templateId} onChange={e => setForm({...form, templateId: e.target.value})} className="border rounded-xl p-2 w-full">
                <option value="">Select Template...</option>
                {data.templates.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
           </div>
           <div className="flex-1">
              <label className="text-xs font-bold text-stone-500 block mb-1">Target Group</label>
              <select value={form.groupId} onChange={e => setForm({...form, groupId: e.target.value})} className="border rounded-xl p-2 w-full">
                <option value="">Select Group...</option>
                {data.groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
           </div>
           <button onClick={handleSave} className="bg-[#36B37E] text-white px-6 py-2 rounded-xl font-bold h-[42px]">Map Event</button>
         </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.mappings.map((m: any) => (
            <div key={m.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
               <div className="flex items-center justify-between mb-4">
                 <span className="px-3 py-1 bg-stone-900 text-white rounded-lg text-xs font-bold">{m.eventId}</span>
                 <button onClick={() => axios.delete('/api/whatsapp/mappings/'+m.id).then(refresh)} className="text-red-400 text-xs font-bold">Remove Mapping</button>
               </div>
               <div className="flex items-center gap-4 text-sm font-bold text-stone-600">
                 <FileText size={16} className="text-blue-500"/> {data.templates.find((t: any) => t.id === m.templateId)?.name || 'Unknown'} 
                 <span className="text-stone-300">→</span>
                 <Users size={16} className="text-purple-500"/> {data.groups.find((g: any) => g.id === m.groupId)?.name || 'Unknown'}
               </div>
            </div>
          ))}
       </div>
    </div>
  )
}

function LogsTab({ data, refresh }: any) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
       <table className="w-full text-left text-sm">
          <thead className="bg-stone-50"><tr>
             <th className="p-4 text-xs font-bold text-stone-500">Time</th>
             <th className="p-4 text-xs font-bold text-stone-500">To</th>
             <th className="p-4 text-xs font-bold text-stone-500">Status</th>
             <th className="p-4 text-xs font-bold text-stone-500">Details</th>
          </tr></thead>
          <tbody className="divide-y divide-stone-100">
            {data.logs.map((l: any) => (
              <tr key={l.id}>
                <td className="p-4 text-xs font-mono">{new Date(l.queuedAt).toLocaleString()}</td>
                <td className="p-4 font-mono font-bold text-stone-700">{l.to}</td>
                <td className="p-4">
                  {l.status === 'sent' && <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-xs font-bold">Sent</span>}
                  {l.status === 'scheduled' && <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">Scheduled (Limit Hit)</span>}
                  {l.status === 'failed' && <span className="bg-red-100 text-red-700 px-2 py-1 rounded-lg text-xs font-bold">Failed</span>}
                  {l.status === 'queued' && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-lg text-xs font-bold">Queued</span>}
                </td>
                <td className="p-4 text-xs">
                   {l.error ? <span className="text-red-500">{l.error}</span> : <span className="text-stone-500 truncate block max-w-[250px]">{l.body}</span>}
                </td>
              </tr>
            ))}
          </tbody>
       </table>
    </div>
  )
}
