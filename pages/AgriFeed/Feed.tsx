
import React, { useEffect, useState, useRef } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriPost, User, AgriTopic } from '../../types';
import PostCard from '../../components/AgriFeed/PostCard';
import { Image as ImageIcon, FileText, BarChart2, Smile, Send, X, AlertCircle, TrendingUp, HelpCircle, MessageSquare } from 'lucide-react';

const Feed: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'for_you';
  
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<AgriTopic[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [postType, setPostType] = useState<'POST' | 'RESEARCH_QUESTION' | 'FARMER_PROBLEM'>('POST');
  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFeed = async () => {
    const feed = await mockBackend.getAgriFeed();
    const topics = await mockBackend.getAgriTopics();
    setPosts(feed);
    setTrendingTopics(topics);
    setLoading(false);
  };

  useEffect(() => {
    fetchFeed();
    // Real-time sync simulated with interval
    const interval = setInterval(fetchFeed, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Max 1 image, Max 200 KB, JPG/PNG/WEBP
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Only JPG, PNG, and WEBP formats are allowed.");
      return;
    }

    if (file.size > 200 * 1024) {
      setImageError("Image must be less than 200 KB.");
      return;
    }

    setImageError(null);
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return;

    // Greeting detection
    const greetings = ['hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'hey'];
    const content = newPostContent.toLowerCase().trim();
    const isGreetingOnly = greetings.some(g => content === g);

    if (isGreetingOnly && !warning) {
      setWarning("Posts containing only greetings are discouraged. Please add more context or research information.");
      return;
    }

    let imageUrl = '';
    if (selectedImage) {
      // Simulate upload
      imageUrl = imagePreview || '';
    }

    const post: Partial<AgriPost> = {
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.profilePhotoUrl || user.avatar,
      authorField: user.occupation,
      content: newPostContent,
      type: postType,
      attachments: selectedImage ? [{ url: imageUrl, type: 'IMAGE', name: selectedImage.name }] : []
    };

    await mockBackend.addAgriPost(post);
    setNewPostContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setWarning(null);
    setPostType('POST');
    fetchFeed();
  };

  const handleLike = async (postId: string) => {
    await mockBackend.likeAgriPost(postId, user.id);
    fetchFeed();
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        await mockBackend.deleteAgriPost(postId, user.id, user.role);
        fetchFeed();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleEdit = async (postId: string, content: string) => {
    await mockBackend.updateAgriPost(postId, content, user.id, user.role);
    fetchFeed();
  };

  const handleUpvote = async (postId: string) => {
    await mockBackend.upvoteAgriPost(postId, user.id);
    fetchFeed();
  };

  const handleReply = async (postId: string, content: string) => {
    if (content && content.trim()) {
      await mockBackend.addAgriComment(postId, {
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.profilePhotoUrl || user.avatar,
        content: content.trim()
      });
      fetchFeed();
    }
  };

  const handleRepost = async (postId: string) => {
    await mockBackend.repostAgriPost(postId, user.id);
    fetchFeed();
  };

  const handleShare = async (postId: string) => {
    await mockBackend.shareAgriPost(postId);
    alert("Post shared successfully!");
    fetchFeed();
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'for_you') return true;
    if (activeTab === 'following') return true; // TODO: Implement following logic
    if (activeTab === 'research_collaboration') return post.type === 'RESEARCH_QUESTION';
    if (activeTab === 'farmer_problems') return post.type === 'FARMER_PROBLEM';
    return true;
  });

  const displayPosts = filteredPosts;

  const tabs = [
    { id: 'for_you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'research_collaboration', label: 'Research Collaboration' },
    { id: 'farmer_problems', label: 'Farmer Problems' },
  ];

  return (
    <div className="flex flex-col">
      {/* Header & Tabs */}
      <div className="sticky top-[65px] md:top-0 z-10 bg-white/90 backdrop-blur-md border-b border-agri-border">
        <div className="p-4 hidden md:block">
          <h2 className="text-xl font-bold text-stone-900">AgriFeed</h2>
        </div>
        <div className="flex overflow-x-auto hide-scrollbar border-b border-agri-border">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setSearchParams({ tab: tab.id })}
              className={`flex-1 min-w-[100px] py-4 text-sm font-bold transition-colors relative whitespace-nowrap px-4 ${
                activeTab === tab.id ? 'text-agri-primary' : 'text-stone-500 hover:bg-agri-secondary/10'
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-agri-primary rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Create Post Area */}
      <div className="p-4 border-b border-agri-border bg-white">
        <div className="flex gap-3">
          <img 
            src={user.profilePhotoUrl || user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
            alt={user.name} 
            className="w-12 h-12 rounded-full bg-stone-200 object-cover"
          />
          <div className="flex-1">
            <div className="flex gap-2 mb-3">
              {(['POST', 'RESEARCH_QUESTION', 'FARMER_PROBLEM'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                    postType === type 
                      ? 'bg-agri-primary text-white shadow-md' 
                      : 'bg-agri-bg text-stone-500 hover:bg-agri-secondary/20'
                  }`}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => {
                setNewPostContent(e.target.value);
                if (warning) setWarning(null);
              }}
              placeholder={
                postType === 'RESEARCH_QUESTION' 
                  ? "Ask a scientific question..." 
                  : postType === 'FARMER_PROBLEM' 
                    ? "Describe a field problem..." 
                    : "What's happening in agriculture research?"
              }
              className="w-full border-none focus:ring-0 text-lg resize-none min-h-[80px] bg-transparent placeholder:text-stone-400 text-stone-900"
            />
            
            {imagePreview && (
              <div className="relative mt-2 mb-4 rounded-2xl overflow-hidden border border-agri-border">
                <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-[400px] object-cover" />
                <button 
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {imageError && (
              <div className="flex items-center gap-2 bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-3 border border-red-100">
                <AlertCircle size={16} />
                {imageError}
              </div>
            )}

            {warning && (
              <div className="bg-orange-50 text-orange-600 p-3 rounded-xl text-sm mb-3 border border-orange-100">
                {warning}
              </div>
            )}

            <div className="flex items-center justify-between border-t border-agri-border pt-3">
              <div className="flex items-center gap-1 text-agri-primary">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  accept="image/jpeg,image/png,image/webp" 
                  className="hidden" 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-agri-secondary/10 rounded-full transition-colors"
                  title="Add Image (Max 200KB)"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-agri-secondary/10 rounded-full transition-colors"><FileText className="w-5 h-5" /></button>
                <button className="p-2 hover:bg-agri-secondary/10 rounded-full transition-colors"><Smile className="w-5 h-5" /></button>
              </div>
              <button 
                onClick={handleCreatePost}
                disabled={(!newPostContent.trim() && !selectedImage) || !!imageError}
                className="bg-agri-primary hover:bg-agri-primary/90 disabled:opacity-50 text-white font-bold px-8 py-2.5 rounded-full transition-all shadow-lg shadow-agri-primary/20 flex items-center gap-2 active:scale-95"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Topics (Only on Trending Tab) */}
      {activeTab === 'trending' && trendingTopics.length > 0 && (
        <div className="p-4 bg-agri-bg border-b border-agri-border">
          <h3 className="text-sm font-black uppercase tracking-widest text-stone-400 mb-4 flex items-center gap-2">
            <TrendingUp size={16} /> Trending Agriculture Topics
          </h3>
          <div className="flex flex-wrap gap-2">
            {trendingTopics.map(topic => (
              <button 
                key={topic.id}
                onClick={() => setNewPostContent(prev => prev + (prev ? ' ' : '') + topic.name)}
                className="bg-white border border-agri-border px-4 py-2 rounded-xl text-sm font-bold text-stone-700 hover:border-agri-primary hover:text-agri-primary transition-all shadow-sm"
              >
                {topic.name}
                <span className="ml-2 text-[10px] text-stone-400 font-normal">{topic.postCount} posts</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Feed */}
      <div className="flex flex-col min-h-screen">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center text-stone-400 gap-4">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-agri-primary"></div>
            <p className="font-bold text-sm">Syncing with AgriFeed...</p>
          </div>
        ) : displayPosts.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-20 h-20 bg-agri-bg rounded-full flex items-center justify-center text-stone-300 mx-auto">
              {activeTab === 'research' ? <HelpCircle size={40} /> : activeTab === 'farmer_help' ? <AlertCircle size={40} /> : <MessageSquare size={40} />}
            </div>
            <h3 className="text-xl font-bold text-stone-800">No posts found</h3>
            <p className="text-stone-500 max-w-xs mx-auto">Be the first to share an update or ask a question in this category!</p>
          </div>
        ) : (
          displayPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user.id}
              currentUserRole={user.role}
              onLike={handleLike}
              onUpvote={handleUpvote}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onReply={handleReply}
              onRepost={handleRepost}
              onShare={handleShare}
            />
          ))
        )}
        
        {!loading && displayPosts.length > 0 && (
          <div className="p-8 text-center">
            <button className="text-agri-primary font-bold hover:underline">Load more posts</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
