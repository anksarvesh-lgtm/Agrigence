import React, { useState, useEffect } from 'react';
import { videoService } from '../services/videoService';
import { Video } from '../types';
import { 
  Play, Search, Filter, Loader2, Calendar, 
  Eye, Clock, X, Share2, Youtube, ExternalLink 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import OptimizedImage from '../components/OptimizedImage';
import SEO from '../components/SEO';

const VideoCard: React.FC<{ video: Video; onClick: () => void }> = ({ video, onClick }) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-3xl shadow-premium border border-stone-100 overflow-hidden group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <OptimizedImage 
          src={video.thumbnail} 
          alt={video.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
          <div className="w-16 h-16 bg-agri-secondary/90 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform shadow-2xl">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white">
          {video.duration}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2 py-1 bg-agri-secondary/10 text-agri-secondary text-[10px] font-black uppercase tracking-widest rounded">
            {video.category}
          </span>
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1">
            <Calendar size={10} /> {new Date(video.publishedAt).toLocaleDateString()}
          </span>
        </div>
        
        <h3 className="text-xl font-serif font-bold text-agri-primary mb-3 line-clamp-2 group-hover:text-agri-secondary transition-colors">
          {video.title}
        </h3>
        
        <p className="text-stone-500 text-sm line-clamp-2 mb-6 leading-relaxed">
          {video.description}
        </p>
        
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-stone-400">
          <span className="flex items-center gap-1"><Eye size={12} /> {video.viewCount} views</span>
          <span className="flex items-center gap-1 text-agri-primary group-hover:text-agri-secondary transition-colors">
            WATCH NOW <ExternalLink size={12} />
          </span>
        </div>
      </div>
      
      {/* Schema Markup */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VideoObject",
          "name": video.title,
          "description": video.description,
          "thumbnailUrl": video.thumbnail,
          "uploadDate": video.publishedAt,
          "contentUrl": `https://www.youtube.com/watch?v=${video.youtubeId}`,
          "embedUrl": `https://www.youtube.com/embed/${video.youtubeId}`
        })}
      </script>
    </motion.div>
  );
};

const Videos: React.FC = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  useEffect(() => {
    const unsub = videoService.subscribeToVideos((data: Video[]) => {
      setVideos(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredVideos = videos.filter(v => {
    const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         v.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', ...Array.from(new Set(videos.map(v => v.category).filter((c): c is string => !!c)))];

  return (
    <div className="min-h-screen bg-agri-bg">
      <SEO 
        title="Agrigence TV | Agricultural Learning Videos"
        description="Watch the latest educational videos on sustainable farming, agtech, and regenerative agriculture."
      />

      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center bg-agri-primary text-white overflow-hidden mb-16">
        <div className="absolute inset-0">
          <OptimizedImage 
            src="https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&q=80&w=2000" 
            alt="Agricultural learning videos" 
            className="w-full h-full object-cover opacity-40"
            priority={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-agri-primary via-transparent to-transparent"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="h-px w-12 bg-agri-secondary"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-agri-secondary">Agrigence TV</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-serif font-bold mb-6 leading-tight">
              Watch & Learn
            </h1>
            <p className="text-lg text-white/80 font-light leading-relaxed max-w-xl">
              Explore our curated collection of educational videos, field reports, and expert interviews.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto px-6 pb-24">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-6 mb-12 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl border border-stone-200 focus:border-agri-secondary outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-4 overflow-x-auto pb-2 w-full md:w-auto no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-agri-primary text-white shadow-lg' 
                    : 'bg-white text-stone-500 border border-stone-200 hover:border-agri-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl shadow-premium border border-stone-100 overflow-hidden animate-pulse">
                <div className="aspect-video bg-stone-200" />
                <div className="p-6">
                  <div className="h-4 bg-stone-200 rounded w-1/4 mb-4" />
                  <div className="h-6 bg-stone-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-stone-200 rounded w-full mb-2" />
                  <div className="h-4 bg-stone-200 rounded w-2/3" />
                </div>
              </div>
            ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredVideos.map((video) => (
                <VideoCard 
                  key={video.id} 
                  video={video} 
                  onClick={() => setActiveVideo(video)} 
                />
              ))}
            </AnimatePresence>
          )}
        </div>

        {!loading && filteredVideos.length === 0 && (
          <div className="text-center py-20 bg-stone-50 rounded-[3rem] border border-stone-100">
            <Youtube size={48} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-400 italic">No videos found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12 bg-agri-primary/95 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-6xl bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full max-h-[90vh]"
            >
              {/* Video Player */}
              <div className="flex-1 bg-black relative flex items-center justify-center">
                <iframe 
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1`}
                  title={activeVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
                <button 
                  onClick={() => setActiveVideo(null)}
                  className="absolute top-6 left-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all md:hidden"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Video Info */}
              <div className="w-full md:w-[400px] p-8 md:p-12 overflow-y-auto flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <span className="px-3 py-1 bg-agri-secondary/10 text-agri-secondary text-[10px] font-black uppercase tracking-widest rounded-lg">
                    {activeVideo.category}
                  </span>
                  <button 
                    onClick={() => setActiveVideo(null)}
                    className="w-10 h-10 bg-stone-100 text-stone-400 hover:text-agri-primary rounded-full flex items-center justify-center transition-all hidden md:flex"
                  >
                    <X size={20} />
                  </button>
                </div>

                <h2 className="text-3xl font-serif font-bold text-agri-primary mb-6 leading-tight">
                  {activeVideo.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-stone-400 uppercase tracking-widest mb-8 border-b border-stone-100 pb-8">
                  <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(activeVideo.publishedAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1"><Eye size={14} /> {activeVideo.viewCount} views</span>
                </div>

                <div className="flex-1">
                  <p className="text-stone-600 leading-relaxed mb-8">
                    {activeVideo.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 mt-auto pt-8 border-t border-stone-100">
                  <button className="flex-1 bg-agri-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-agri-secondary transition-all shadow-xl">
                    <Share2 size={18} /> Share Video
                  </button>
                  <a 
                    href={`https://www.youtube.com/watch?v=${activeVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-14 h-14 bg-stone-100 text-agri-primary rounded-2xl flex items-center justify-center hover:bg-stone-200 transition-all"
                  >
                    <Youtube size={24} />
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Videos;
