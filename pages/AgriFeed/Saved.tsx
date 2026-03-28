
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriPost, User } from '../../types';
import PostCard from '../../components/AgriFeed/PostCard';
import { Bookmark } from 'lucide-react';

const Saved: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      // In a real app, we'd have a 'saved_posts' collection
      // For now, we'll just show some posts as a placeholder
      const allPosts = await mockBackend.getAgriPosts();
      setPosts(allPosts.slice(0, 2)); 
      setLoading(false);
    };
    fetchSaved();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-green-600" />
          Saved Research
        </h2>
      </div>

      {/* Posts */}
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
            />
          ))
        ) : (
          <div className="p-20 text-center">
            <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mx-auto mb-4">
              <Bookmark className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">Save posts for later</h3>
            <p className="text-stone-500 max-w-xs mx-auto">Don't let good research fly by! Bookmark posts to easily find them again in the future.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Saved;
