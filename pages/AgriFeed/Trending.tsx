
import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { mockBackend } from '../../services/mockBackend';
import { AgriPost, User, AgriTopic } from '../../types';
import PostCard from '../../components/AgriFeed/PostCard';
import { TrendingUp } from 'lucide-react';

const Trending: React.FC = () => {
  const { user } = useOutletContext<{ user: User }>();
  const [posts, setPosts] = useState<AgriPost[]>([]);
  const [topics, setTopics] = useState<AgriTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [p, t] = await Promise.all([
        mockBackend.getAgriPosts(),
        mockBackend.getAgriTopics()
      ]);
      // Sort by likes for trending
      setPosts(p.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)));
      setTopics(t);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-200 p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-600" />
          Trending in Agriculture
        </h2>
      </div>

      {/* Trending Topics */}
      <div className="p-4 border-b border-stone-200 overflow-x-auto flex gap-2 no-scrollbar">
        {topics.map(topic => (
          <div key={topic.id} className="bg-stone-100 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium hover:bg-stone-200 cursor-pointer transition-colors">
            #{topic.name.replace(/\s+/g, '')}
          </div>
        ))}
      </div>

      {/* Posts */}
      <div className="flex flex-col">
        {loading ? (
          <div className="p-10 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-green-600"></div>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUserId={user.id}
              currentUserRole={user.role}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Trending;
