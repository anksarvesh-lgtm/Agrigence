
import React, { useState } from 'react';
import { AgriPost } from '../../types';
import { MessageCircle, Heart, Repeat2, Bookmark, Share2, MoreHorizontal, Trash2, Edit3, CheckCircle2, ArrowBigUp, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: AgriPost;
  onLike?: (id: string) => void;
  onUpvote?: (id: string) => void;
  onReply?: (id: string, content: string) => Promise<void>;
  onRepost?: (id: string) => void;
  onSave?: (id: string) => void;
  onShare?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, content: string) => void;
  currentUserId?: string;
  currentUserRole?: string;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onUpvote, onReply, onRepost, onSave, onShare, onDelete, onEdit, currentUserId, currentUserRole }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  
  const isLiked = currentUserId ? post.likes.includes(currentUserId) : false;
  const isUpvoted = currentUserId ? post.upvotes?.includes(currentUserId) : false;
  const isReposted = currentUserId ? post.reposts.includes(currentUserId) : false;
  const isAuthor = currentUserId === post.authorId;
  const isAdmin = currentUserRole === 'ADMIN' || currentUserRole === 'SUPER_ADMIN';
  const isNativePost = !['BLOG', 'NEWS', 'MAGAZINE'].includes(post.type || '');
  const canEditOrDelete = (isAuthor || isAdmin) && isNativePost;

  const handleUpdate = () => {
    if (editContent.trim() && onEdit) {
      onEdit(post.id, editContent);
      setIsEditing(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply || isSubmittingReply) return;

    setIsSubmittingReply(true);
    try {
      await onReply(post.id, replyContent.trim());
      setReplyContent('');
    } catch (err) {
      console.error("Failed to post reply:", err);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <div className="border-b border-stone-200 p-4 hover:bg-stone-50 transition-colors cursor-pointer group relative">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img 
            src={post.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName}`} 
            alt={post.authorName} 
            className="w-12 h-12 rounded-full bg-stone-200 object-cover"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 overflow-hidden">
              <span className="font-bold text-stone-900 truncate hover:underline">{post.authorName}</span>
              {post.authorVerified && (
                <CheckCircle2 size={14} className="text-green-600 fill-green-50 flex-shrink-0" />
              )}
              {post.authorField && (
                <span className="text-stone-500 text-sm truncate hidden sm:inline">• {post.authorField}</span>
              )}
              <span className="text-stone-500 text-sm flex-shrink-0">
                • {(() => {
                  try {
                    if (!post.timestamp) return 'Recently';
                    
                    let date: Date;
                    // Handle Firestore Timestamp
                    if (typeof post.timestamp === 'object' && post.timestamp !== null && 'toDate' in post.timestamp) {
                      date = (post.timestamp as any).toDate();
                    } else if (typeof post.timestamp === 'object' && post.timestamp !== null && 'seconds' in post.timestamp) {
                      date = new Date((post.timestamp as any).seconds * 1000);
                    } else {
                      date = new Date(post.timestamp);
                    }

                    if (isNaN(date.getTime())) return 'Recently';
                    return formatDistanceToNow(date, { addSuffix: true });
                  } catch (e) {
                    return 'Recently';
                  }
                })()}
              </span>
            </div>
            <div className="relative">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
                className="text-stone-400 hover:text-green-600 p-1 rounded-full hover:bg-green-50 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-stone-100 z-20 py-2">
                  {canEditOrDelete && (
                    <>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                      >
                        <Edit3 size={16} /> Edit Post
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); onDelete?.(post.id); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={16} /> Delete Post
                      </button>
                    </>
                  )}
                  <button 
                    onClick={(e) => { e.stopPropagation(); onSave?.(post.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                  >
                    <Bookmark size={16} /> Save Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Label for mixed content */}
          {(post.label || post.type === 'RESEARCH_QUESTION' || post.type === 'FARMER_PROBLEM') && (
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-2 ${
              post.type === 'RESEARCH_QUESTION' ? 'bg-blue-600 text-white' :
              post.type === 'FARMER_PROBLEM' ? 'bg-orange-600 text-white' :
              post.label === 'Blog' ? 'bg-blue-100 text-blue-600' :
              post.label === 'AgriNews' ? 'bg-orange-100 text-orange-600' :
              'bg-purple-100 text-purple-600'
            }`}>
              {post.type === 'RESEARCH_QUESTION' ? 'Research Question' : 
               post.type === 'FARMER_PROBLEM' ? 'Farmer Problem' : 
               post.label}
            </span>
          )}

          {/* Post Text */}
          {isEditing ? (
            <div className="mt-2" onClick={(e) => e.stopPropagation()}>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-stone-800"
                rows={3}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1.5 text-sm font-bold text-stone-500 hover:bg-stone-100 rounded-full"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleUpdate}
                  className="px-4 py-1.5 text-sm font-bold bg-green-600 text-white hover:bg-green-700 rounded-full"
                >
                  Update
                </button>
              </div>
            </div>
          ) : (
            <p className="text-stone-800 whitespace-pre-wrap break-words mt-1 leading-relaxed">
              {post.content}
            </p>
          )}

          {/* Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="mt-3 grid grid-cols-1 gap-2">
              {post.attachments.map((att, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-stone-200">
                  {att.type === 'IMAGE' ? (
                    <img src={att.url} alt={att.name} className="w-full h-auto max-h-96 object-cover" />
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-white hover:bg-stone-50 transition-colors">
                      <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center text-green-600">
                        {att.type === 'PDF' ? 'PDF' : 'DOC'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{att.name}</p>
                        <p className="text-xs text-stone-500 uppercase">{att.type}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Interaction Buttons */}
          <div className="flex items-center justify-between mt-4 max-w-md text-stone-500">
            <button 
              onClick={(e) => { e.stopPropagation(); setShowReplies(!showReplies); }}
              className={`flex items-center gap-2 hover:text-agri-primary transition-colors group/btn ${showReplies ? 'text-agri-primary' : ''}`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-agri-secondary/10">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm">{post.replies.length}</span>
            </button>

            <button 
              onClick={(e) => { e.stopPropagation(); onRepost?.(post.id); }}
              className={`flex items-center gap-2 hover:text-green-600 transition-colors group/btn ${isReposted ? 'text-green-600' : ''}`}
            >
              <div className="p-2 rounded-full group-hover/btn:bg-green-50">
                <Repeat2 className="w-5 h-5" />
              </div>
              <span className="text-sm">{post.reposts.length}</span>
            </button>

            {post.type === 'RESEARCH_QUESTION' ? (
              <button 
                onClick={(e) => { e.stopPropagation(); onUpvote?.(post.id); }}
                className={`flex items-center gap-1 hover:text-blue-600 transition-colors group/btn ${isUpvoted ? 'text-blue-600' : ''}`}
              >
                <div className="p-2 rounded-full group-hover/btn:bg-blue-50">
                  <ArrowBigUp className={`w-6 h-6 ${isUpvoted ? 'fill-current' : ''}`} />
                </div>
                <span className="text-sm font-bold">{post.upvotes?.length || 0}</span>
              </button>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); onLike?.(post.id); }}
                className={`flex items-center gap-2 hover:text-agri-primary transition-colors group/btn ${isLiked ? 'text-agri-primary' : ''}`}
              >
                <div className="p-2 rounded-full group-hover/btn:bg-agri-secondary/10">
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                </div>
                <span className="text-sm">{post.likes.length}</span>
              </button>
            )}

            <button 
              onClick={(e) => { e.stopPropagation(); onShare?.(post.id); }}
              className="flex items-center gap-2 hover:text-agri-primary transition-colors group/btn"
            >
              <div className="p-2 rounded-full group-hover/btn:bg-agri-secondary/10">
                <Share2 className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* Replies Section */}
          {showReplies && (
            <div className="mt-4 space-y-4 border-t border-stone-100 pt-4" onClick={(e) => e.stopPropagation()}>
              {/* Add Reply Form */}
              <form onSubmit={handleReplySubmit} className="flex gap-2">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUserId}`} 
                  alt="Me" 
                  className="w-8 h-8 rounded-full bg-stone-200 object-cover"
                />
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    disabled={isSubmittingReply}
                  />
                  <button 
                    type="submit"
                    disabled={!replyContent.trim() || isSubmittingReply}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 disabled:text-stone-300 transition-colors"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>

              {post.replies.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {post.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-2">
                      <img 
                        src={reply.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reply.authorName}`} 
                        alt={reply.authorName} 
                        className="w-8 h-8 rounded-full bg-stone-200 object-cover"
                      />
                      <div className="flex-1 bg-stone-50 rounded-2xl p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs text-stone-900">{reply.authorName}</span>
                          <span className="text-[10px] text-stone-500">
                            {(() => {
                              try {
                                const date = new Date(reply.timestamp);
                                return isNaN(date.getTime()) ? 'Recently' : formatDistanceToNow(date, { addSuffix: true });
                              } catch (e) {
                                return 'Recently';
                              }
                            })()}
                          </span>
                        </div>
                        <p className="text-sm text-stone-800">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-400 italic px-2">No replies yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCard;
