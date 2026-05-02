import React, { useState, useEffect } from 'react';
import { mockBackend } from '../../services/mockBackend';
import { FarmerQuestion } from '../../types';
import { useAuth } from '../../App';
import { useConfirm } from '../../components/ContextualConfirm';
import { Trash2, Search, Mic, MessageCircle, AlertCircle } from 'lucide-react';

const FarmerConnectManagement: React.FC = () => {
    const { user } = useAuth();
    const { confirm } = useConfirm();
    const [questions, setQuestions] = useState<FarmerQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const data = await mockBackend.getFarmerQuestions();
            setQuestions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
            console.error("Failed to load questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (await confirm({ message: "Are you sure you want to delete this question? All associated replies will be orphaned.", type: 'danger' })) {
            try {
                await mockBackend.deleteFarmerQuestion(id);
                loadQuestions();
            } catch (error) {
                console.error("Failed to delete question:", error);
                alert("Could not delete question.");
            }
        }
    };

    const filtered = questions.filter(q => q.question.toLowerCase().includes(search.toLowerCase()));

    if (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN') {
        return <div className="p-8 text-center text-red-500 font-bold">Access Denied</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-admin-border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-admin-text">Farmer Connect Moderation</h1>
                    <p className="text-admin-muted text-xs mt-1 uppercase tracking-widest font-bold">Manage Questions & Voice Notes</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-admin-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-admin-border flex items-center gap-4 bg-gray-50/50">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search questions..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:border-green-500 outline-none"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-admin-bg/50 text-[10px] uppercase tracking-widest text-admin-muted border-b border-admin-border">
                                <th className="p-4 font-bold">Content</th>
                                <th className="p-4 font-bold">Date</th>
                                <th className="p-4 font-bold text-center">Replies</th>
                                <th className="p-4 font-bold">Type</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-admin-muted text-sm animate-pulse">Loading...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-admin-muted text-sm">No questions found.</td>
                                </tr>
                            ) : (
                                filtered.map(question => (
                                    <tr key={question.id} className="border-b border-admin-border hover:bg-admin-bg/30 transition-colors">
                                        <td className="p-4">
                                            <p className="font-medium text-admin-text text-sm line-clamp-2">
                                                {question.question || <span className="italic text-gray-400">Voice note only</span>}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-admin-muted">
                                                {new Date(question.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="inline-flex items-center justify-center bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-bold font-mono">
                                                {question.repliesCount || 0}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
                                                {question.audioUrl ? <Mic size={10} className="text-blue-500"/> : <MessageCircle size={10} className="text-green-500" />}
                                                {question.audioUrl ? 'Voice' : 'Text'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleDelete(question.id!)} className="p-2 hover:bg-red-50 text-admin-muted hover:text-red-500 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
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

export default FarmerConnectManagement;
