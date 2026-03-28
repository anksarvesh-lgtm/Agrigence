
import React, { useEffect, useState } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriPost, User } from '../../types';
import PostCard from '../../components/AgriFeed/PostCard';
import { Search } from 'lucide-react';

const Explore: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setSearchTerm(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (query: string) => {
    setLoading(true);
    const results = await mockBackend.searchAgriPosts(query);
    setPosts(results);
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setSearchParams({ q: searchTerm });
  };

  const handleLike = async (postId: string) => {
    await mockBackend.likeAgriPost(postId, user.id);
    if (searchTerm) {
        const results = await mockBackend.searchAgriPosts(searchTerm);
        setPosts(results);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search AgriFeed..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-stone-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-green-500 transition-all"
          />
        </form>
      </div>

      {/* Results */}
      <div className="flex flex-col">
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          </div>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user.id}
              currentUserRole={user.role}
              onLike={handleLike}
            />
          ))
        ) : searchTerm && !loading ? (
          <div className="p-10 text-center text-stone-500">
            No results found for "{searchTerm}"
          </div>
        ) : (
          <div className="p-10 text-center text-stone-500">
            Search for research topics, researchers, or keywords.
          </div>
        )}
      </div>
    </div>
  );
};

export default Explore;
