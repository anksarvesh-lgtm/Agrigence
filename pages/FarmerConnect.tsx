import React, { useState, useEffect, useRef } from 'react';
import { mockBackend } from '../services/mockBackend';
import { FarmerQuestion, FarmerReply } from '../types';
import { useAuth } from '../App';
import { MessageCircle, Send, User, Mic, Square, Play, ShieldCheck, Clock, Trash2 } from 'lucide-react';
import SEO from '../components/SEO';

const FarmerConnect: React.FC<{ hideHeader?: boolean }> = ({ hideHeader }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<FarmerQuestion[]>([]);
    const [newQuestion, setNewQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

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

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleAskQuestion = async () => {
        if (!newQuestion.trim() && !audioBlob) return;
        
        try {
            let audioUrl = undefined;
            if (audioBlob) {
                // Simulated upload - in reality upload to Firebase Storage
                const file = new File([audioBlob], "voice_note.webm", { type: "audio/webm" });
                audioUrl = await mockBackend.uploadFile(file, 'voice_notes');
            }

            const payload: any = {
                question: newQuestion,
                createdAt: new Date().toISOString(),
                repliesCount: 0
            };
            
            if (audioUrl) {
                payload.audioUrl = audioUrl;
            }

            await mockBackend.addFarmerQuestion(payload);

            setNewQuestion('');
            setAudioBlob(null);
            loadQuestions();
        } catch (error) {
            console.error("Failed to ask question:", error);
            alert("Could not post question.");
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
            <SEO title="Farmer Connect - Agrigence" description="Ask your farming questions anonymously and get answers from experts." />
            
            <main className={`flex-1 max-w-4xl mx-auto w-full p-4 ${hideHeader ? '' : 'py-8'}`}>
                {!hideHeader && (
                    <div className="mb-10 text-center">
                        <h1 className="text-3xl md:text-5xl font-serif font-bold text-agri-primary mb-4">Farmer Connect</h1>
                        <p className="text-stone-500 font-medium">Ask questions anonymously. Get reliable answers from the community and top experts.</p>
                    </div>
                )}

                {/* Ask Box */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 mb-8">
                    <h2 className="text-sm font-black uppercase tracking-widest text-agri-secondary mb-4 flex items-center gap-2">
                        <MessageCircle size={16} /> Ask Anonymously
                    </h2>
                    
                    <textarea 
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-4 min-h-[120px] outline-none focus:border-agri-secondary focus:ring-1 focus:ring-agri-secondary transition-all resize-none text-stone-700"
                        placeholder="Type your question here (in any language)..."
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                    />
                    
                    <div className="flex flex-wrap justify-between items-center mt-4 gap-4">
                        <div className="flex items-center gap-4">
                            {isRecording ? (
                                <button onClick={stopRecording} className="flex items-center gap-2 bg-red-50 text-red-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-red-100 transition-colors">
                                    <Square size={14} className="animate-pulse" /> Stop Recording
                                </button>
                            ) : (
                                <button onClick={startRecording} className="flex items-center gap-2 bg-stone-100 text-stone-600 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-stone-200 transition-colors">
                                    <Mic size={14} /> Record Voice Note
                                </button>
                            )}

                            {audioBlob && !isRecording && (
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase">Audio Ready</span>
                                    <button onClick={() => setAudioBlob(null)} className="text-xs text-stone-400 hover:text-red-500">Remove</button>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={handleAskQuestion}
                            disabled={!newQuestion.trim() && !audioBlob}
                            className="bg-agri-primary text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-agri-secondary transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2"
                        >
                            Post Question <Send size={14} />
                        </button>
                    </div>
                </div>

                {/* Questions Feed */}
                <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-stone-600 mb-6 flex items-center gap-2 border-b border-stone-200 pb-2">
                        Recent Questions ({questions.length})
                    </h3>

                    {loading ? (
                        <div className="text-center py-10 text-stone-400 text-xs font-bold uppercase tracking-widest animate-pulse">Loading feed...</div>
                    ) : questions.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-3xl border border-stone-200">
                            <MessageCircle size={48} className="mx-auto text-stone-200 mb-4" />
                            <p className="text-stone-500">No questions yet. Be the first to ask!</p>
                        </div>
                    ) : (
                        questions.map(q => (
                            <QuestionCard key={q.id} question={q} user={user} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

const QuestionCard = ({ question, user }: { question: FarmerQuestion, user: any }) => {
    const [replies, setReplies] = useState<FarmerReply[]>([]);
    const [showReplies, setShowReplies] = useState(false);
    const [newReply, setNewReply] = useState('');
    const [loading, setLoading] = useState(false);

    const loadReplies = async () => {
        setLoading(true);
        try {
            const data = await mockBackend.getFarmerReplies(question.id);
            setReplies(data);
        } catch (error) {
            console.error("Failed to load replies:", error);
            // Ignore error visually, maybe just empty replies
        } finally {
            setLoading(false);
            setShowReplies(true);
        }
    };

    const handleReply = async () => {
        if (!newReply.trim()) return;
        
        try {
            await mockBackend.addFarmerReply({
                questionId: question.id,
                reply: newReply,
                authorId: user?.id || 'anonymous',
                authorName: user?.name || 'Anonymous Farmer',
                isExpert: user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'EXPERT',
                createdAt: new Date().toISOString()
            });
            setNewReply('');
            loadReplies(); // Refresh
        } catch (error) {
            console.error("Failed to add reply", error);
            alert("Could not post reply");
        }
    };

    const handleDeleteQuestion = async () => {
        if (!confirm('Are you sure you want to delete this question?')) return;
        setLoading(true);
        try {
            await mockBackend.deleteFarmerQuestion(question.id);
            window.location.reload(); 
        } catch (error) {
            console.error("Failed to delete question", error);
            alert("Could not delete question");
            setLoading(false);
        }
    };

    const handleDeleteReply = async (replyId: string) => {
        if (!confirm('Are you sure you want to delete this reply?')) return;
        setLoading(true);
        try {
            await mockBackend.deleteFarmerReply(replyId, question.id);
            loadReplies();
        } catch (error) {
            console.error("Failed to delete reply", error);
            alert("Could not delete reply");
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-stone-200 transition-all hover:shadow-md relative">
            {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                <button 
                    onClick={handleDeleteQuestion}
                    className="absolute top-4 right-4 p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete Question"
                >
                    <Trash2 size={16} />
                </button>
            ) : null}
            
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                    <User size={18} className="text-stone-400" />
                </div>
                <div>
                    <h4 className="font-bold text-stone-800 text-sm">Anonymous Farmer</h4>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest flex items-center gap-1">
                        <Clock size={10} /> {new Date(question.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {question.question && <p className="text-stone-700 leading-relaxed mb-4">{question.question}</p>}
            
            {question.audioUrl && (
                <div className="mb-4 bg-stone-50 p-3 rounded-2xl inline-flex items-center gap-3 border border-stone-200">
                    <button onClick={() => new Audio(question.audioUrl).play()} className="w-8 h-8 bg-agri-secondary text-white rounded-full flex items-center justify-center hover:bg-agri-primary transition-colors">
                        <Play size={12} className="ml-0.5" />
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Voice Note</span>
                </div>
            )}

            <div className="border-t border-stone-100 pt-4 mt-2 flex items-center justify-between">
                <button 
                    onClick={() => showReplies ? setShowReplies(false) : loadReplies()}
                    className="text-xs font-bold uppercase tracking-widest text-agri-secondary hover:text-agri-primary transition-colors flex items-center gap-2"
                >
                    <MessageCircle size={14} /> 
                    {question.repliesCount} {question.repliesCount === 1 ? 'Reply' : 'Replies'}
                </button>
            </div>

            {showReplies && (
                <div className="mt-6 space-y-4">
                    {loading ? (
                        <div className="text-[10px] text-stone-400 uppercase text-center py-2 animate-pulse">Loading replies...</div>
                    ) : replies.length === 0 ? (
                        <div className="text-[10px] text-stone-400 uppercase text-center py-4 bg-stone-50 rounded-2xl">No replies yet.</div>
                    ) : (
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {replies.map(r => (
                                <div key={r.id} className={`p-4 rounded-2xl relative ${r.isExpert ? 'bg-green-50 border border-green-100' : 'bg-stone-50 border border-stone-100'}`}>
                                    {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' ? (
                                        <button 
                                            onClick={() => handleDeleteReply(r.id!)}
                                            className="absolute top-2 right-2 p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                            title="Delete Reply"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    ) : null}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-stone-800">{r.authorName}</span>
                                            {r.isExpert && (
                                                <span className="bg-green-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <ShieldCheck size={10} /> Top Expert
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[9px] text-stone-400 uppercase mr-6">{new Date(r.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-stone-600">{r.reply}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {user ? (
                        <div className="mt-4 flex gap-2">
                            <input 
                                type="text"
                                placeholder="Write a reply..."
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 text-sm outline-none focus:border-agri-secondary"
                                value={newReply}
                                onChange={e => setNewReply(e.target.value)}
                            />
                            <button 
                                onClick={handleReply}
                                disabled={!newReply.trim()}
                                className="bg-agri-secondary text-white px-4 py-2 rounded-xl text-xs font-bold uppercase disabled:opacity-50 hover:bg-agri-primary transition-colors"
                            >
                                Reply
                            </button>
                        </div>
                    ) : (
                        <div className="mt-4 text-center py-3 bg-stone-50 rounded-xl text-xs text-stone-500 border border-stone-200">
                            Please sign in to reply to this question.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FarmerConnect;
