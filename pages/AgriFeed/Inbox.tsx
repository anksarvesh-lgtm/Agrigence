
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { User, AgriConversation, AgriMessage } from '../../types';
import { Search, Send, Paperclip, MoreVertical, Info, Mail, X, FileText, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../src/firebase';

const Inbox: React.FC = () => {
  const { user: currentUser } = useOutletContext<{ user: User }>();
  const [conversations, setConversations] = useState<AgriConversation[]>([]);
  const [connections, setConnections] = useState<User[]>([]);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedConv, setSelectedConv] = useState<AgriConversation | null>(null);
  const [messages, setMessages] = useState<AgriMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState<User | null>(null);
  const [userMap, setUserMap] = useState<Record<string, User>>({});
  const [searchParams] = useSearchParams();
  const startWith = searchParams.get('startWith');

  useEffect(() => {
    const fetchConvs = async () => {
      const [convs, allUsers, allConnections] = await Promise.all([
        mockBackend.getAgriConversations(currentUser.id),
        mockBackend.getUsers(),
        mockBackend.getAgriConnections(currentUser.id)
      ]);
      setConversations(convs);

      const map: Record<string, User> = {};
      allUsers.forEach(u => map[u.id] = u);
      setUserMap(map);

      // Filter friends (accepted connections)
      const friendIds = allConnections
        .filter(c => c.status === 'ACCEPTED')
        .map(c => c.senderId === currentUser.id ? c.receiverId : c.senderId);
      
      const friends = allUsers.filter(u => friendIds.includes(u.id));
      setConnections(friends);

      // Filter suggestions (not current user, not friends)
      const suggested = allUsers.filter(u => u.id !== currentUser.id && !friendIds.includes(u.id));
      setSuggestions(suggested.slice(0, 5));
      
      if (startWith) {
        const existing = convs.find(c => c.participants.includes(startWith));
        if (existing) {
          setSelectedConv(existing);
        } else {
          // Create new conversation
          const convId = await mockBackend.createAgriConversation([currentUser.id, startWith]);
          const newConv: AgriConversation = {
            id: convId,
            participants: [currentUser.id, startWith],
            unreadCount: { [currentUser.id]: 0, [startWith]: 0 }
          };
          setConversations([newConv, ...convs]);
          setSelectedConv(newConv);
        }
      }
      setLoading(false);
    };
    fetchConvs();
  }, [currentUser.id, startWith]);

  useEffect(() => {
    if (selectedConv) {
      const q = query(
        collection(db, 'agri_messages'),
        where('conversationId', '==', selectedConv.id),
        orderBy('timestamp', 'asc')
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AgriMessage));
        setMessages(msgs);
      });

      const otherId = selectedConv.participants.find(id => id !== currentUser.id);
      if (otherId && userMap[otherId]) {
        setParticipant(userMap[otherId]);
      } else if (otherId) {
        const fetchParticipant = async () => {
          const p = await mockBackend.getUser(otherId);
          setParticipant(p);
        };
        fetchParticipant();
      }

      return () => unsubscribe();
    }
  }, [selectedConv, currentUser.id, userMap]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('File size exceeds 2MB limit.');
      return;
    }

    const allowedTypes = [
      'image/jpeg', 'image/png', 'application/pdf', 
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-excel', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('File type not allowed. Only images, PDFs, and Excel files are supported.');
      return;
    }

    setAttachment(file);
  };

  const handleSendMessage = async () => {
    console.log("handleSendMessage called", { newMessage, attachment, selectedConv });
    if ((!newMessage.trim() && !attachment) || !selectedConv) {
      console.log("handleSendMessage returned early", { newMessage, attachment, selectedConv });
      return;
    }

    let attachmentData = undefined;
    if (attachment) {
      console.log("Uploading attachment", attachment);
      const url = await mockBackend.uploadFile(attachment, `chat/${selectedConv.id}`);
      attachmentData = {
        url,
        type: attachment.type.includes('image') ? 'IMAGE' : attachment.type.includes('pdf') ? 'PDF' : 'DOC',
        name: attachment.name
      };
    }

    const msg: Partial<AgriMessage> = {
      conversationId: selectedConv.id,
      senderId: currentUser.id,
      receiverId: selectedConv.participants.find(id => id !== currentUser.id)!,
      text: newMessage,
      attachments: attachmentData ? [attachmentData] : undefined
    };

    console.log("Sending message", msg);
    try {
      await mockBackend.sendAgriMessage(msg.conversationId!, msg.senderId!, msg.receiverId!, msg.text!, msg.attachments);
      console.log("Message sent successfully");
      setNewMessage('');
      setAttachment(null);
      const msgs = await mockBackend.getAgriMessages(selectedConv.id);
      setMessages(msgs);
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] overflow-hidden">
      {/* Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 border-r border-stone-200 flex flex-col ${selectedConv ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-stone-200">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="w-full bg-stone-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-10 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
            </div>
          ) : (
            <>
              {/* Conversations */}
              <div className="p-4">
                <h3 className="text-sm font-bold text-stone-500 mb-2">Conversations</h3>
                {conversations.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No active conversations.</p>
                ) : (
                  conversations.map((conv) => {
                    const otherId = conv.participants.find(id => id !== currentUser.id);
                    const otherUser = otherId ? userMap[otherId] : null;
                    return (
                    <div 
                      key={conv.id} 
                      onClick={() => setSelectedConv(conv)}
                      className={`p-3 flex gap-3 cursor-pointer hover:bg-stone-50 transition-colors rounded-xl ${selectedConv?.id === conv.id ? 'bg-green-50' : ''}`}
                    >
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full bg-stone-200 flex-shrink-0 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex-shrink-0 flex items-center justify-center text-stone-500 font-bold">
                          {otherUser?.name?.[0] || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate">{otherUser?.name || 'Unknown User'}</p>
                        <p className="text-xs text-stone-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                      </div>
                    </div>
                  )})
                )}
              </div>

              {/* Friends List */}
              <div className="p-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-500 mb-2">Friends</h3>
                {connections.length === 0 ? (
                  <p className="text-xs text-stone-400 italic">No friends yet.</p>
                ) : (
                  connections.map((friend) => (
                    <div 
                      key={friend.id} 
                      onClick={async () => {
                        const convId = await mockBackend.createAgriConversation([currentUser.id, friend.id]);
                        setSelectedConv({ id: convId, participants: [currentUser.id, friend.id], unreadCount: { [currentUser.id]: 0, [friend.id]: 0 } });
                      }}
                      className="p-3 flex gap-3 cursor-pointer hover:bg-stone-50 transition-colors rounded-xl"
                    >
                      <img src={friend.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.name}`} className="w-10 h-10 rounded-full bg-stone-200" alt={friend.name} />
                      <div className="flex-1 min-w-0 flex items-center">
                        <p className="font-bold text-sm truncate">{friend.name}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Suggestions */}
              <div className="p-4 border-t border-stone-100">
                <h3 className="text-sm font-bold text-stone-500 mb-2">Suggestions</h3>
                {suggestions.map((user) => (
                  <div 
                    key={user.id} 
                    className="p-3 flex gap-3 items-center"
                  >
                    <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} className="w-10 h-10 rounded-full bg-stone-200" alt={user.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{user.name}</p>
                      <button 
                        onClick={async () => {
                          await mockBackend.sendConnectionRequest(currentUser.id, user.id);
                          // Refresh suggestions?
                        }}
                        className="text-xs text-green-600 font-bold hover:underline"
                      >
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-white ${!selectedConv ? 'hidden md:flex items-center justify-center p-10 text-center' : 'flex'}`}>
        {!selectedConv ? (
          <div className="max-w-sm">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4">
              <Mail className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Select a message</h3>
            <p className="text-stone-500">Choose from your existing conversations, start a new one, or just keep swimming.</p>
            <button className="mt-6 bg-green-600 text-white font-bold px-6 py-3 rounded-full hover:bg-green-700 transition-colors">
              New Message
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden p-2 hover:bg-stone-100 rounded-full">
                  <Search className="w-5 h-5 rotate-180" />
                </button>
                {(() => {
                  const otherId = selectedConv.participants.find(id => id !== currentUser.id);
                  const otherUser = otherId ? userMap[otherId] : null;
                  return (
                    <>
                      {otherUser?.avatar ? (
                        <img src={otherUser.avatar} alt={otherUser.name} className="w-10 h-10 rounded-full bg-stone-200 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">
                          {otherUser?.name?.[0] || '?'}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm leading-tight">{otherUser?.name || 'Unknown User'}</p>
                        <p className="text-green-600 text-[10px] font-bold uppercase tracking-wider">Online</p>
                      </div>
                    </>
                  );
                })()}
              </div>
              <div className="flex items-center gap-1 text-green-600">
                <button className="p-2 hover:bg-green-50 rounded-full"><Info className="w-5 h-5" /></button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser.id;
                const senderName = isMe ? currentUser.name : (userMap[msg.senderId]?.name || 'Unknown User');
                return (
                  <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    {!isMe && <span className="text-[10px] text-stone-500 mb-1 ml-1">{senderName}</span>}
                    <div className={`max-w-[70%] p-3 rounded-2xl shadow-sm ${
                      isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-stone-800 rounded-tl-none border border-stone-100'
                    }`}>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="mb-2 space-y-2">
                          {msg.attachments.map((att, i) => (
                            <div key={i}>
                              {att.type === 'IMAGE' ? (
                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-black/10">
                                  <img src={att.url} alt={att.name} className="max-w-full max-h-64 object-contain bg-black/5" />
                                </a>
                              ) : att.type === 'PDF' ? (
                                <div className="rounded-lg overflow-hidden border border-black/10 bg-white">
                                  <iframe src={`${att.url}#view=FitH`} className="w-full h-64 border-none" title={att.name} />
                                  <a href={att.url} target="_blank" rel="noopener noreferrer" className="block p-2 text-center text-xs bg-black/5 hover:bg-black/10 transition-colors text-stone-800">
                                    Open PDF in new tab
                                  </a>
                                </div>
                              ) : (
                                <a href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-xs hover:bg-black/20 transition-colors">
                                  <FileText className="w-4 h-4 shrink-0" />
                                  <span className="truncate">{att.name}</span>
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                      <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-stone-400'}`}>
                        {format(new Date(msg.timestamp), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-stone-200 bg-white">
              {attachment && (
                <div className="mb-2 p-2 bg-stone-100 rounded-lg flex items-center justify-between text-xs">
                  <span>{attachment.name}</span>
                  <button onClick={() => setAttachment(null)}><X className="w-4 h-4 text-red-500" /></button>
                </div>
              )}
              <div className="flex items-center gap-2 bg-stone-100 rounded-2xl p-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-stone-500 hover:text-green-600 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Start a new message" 
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && !attachment)}
                  className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Inbox;
