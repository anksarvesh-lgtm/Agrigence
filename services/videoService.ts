import { Video, VideoSource } from '../types';
import { mockBackend as backend } from './mockBackend';

const YOUTUBE_API_KEY = process.env.VITE_YOUTUBE_API_KEY;

export const videoService = {
  async getSources(): Promise<VideoSource[]> {
    return await backend.getVideoSources();
  },

  async addSource(source: Partial<VideoSource>): Promise<void> {
    await backend.addVideoSource(source);
  },

  async deleteSource(id: string): Promise<void> {
    await backend.deleteVideoSource(id);
  },

  async updateSource(id: string, data: Partial<VideoSource>): Promise<void> {
    await backend.updateVideoSource(id, data);
  },

  subscribeToVideos(callback: (videos: Video[]) => void) {
    return backend.subscribeToVideos(callback);
  },

  async fetchVideosFromSource(source: VideoSource): Promise<Video[]> {
    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API Key not found. Using mock data.');
      return this.getMockVideos();
    }

    try {
      let url = '';
      if (source.type === 'CHANNEL') {
        // First get the uploads playlist ID
        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${source.url}&key=${YOUTUBE_API_KEY}`
        );
        const channelData = await channelRes.json();
        if (!channelData.items || channelData.items.length === 0) throw new Error('Channel not found');
        const playlistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
        url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${playlistId}&key=${YOUTUBE_API_KEY}`;
      } else {
        url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=50&playlistId=${source.url}&key=${YOUTUBE_API_KEY}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.items) throw new Error(data.error?.message || 'Failed to fetch videos');

      return data.items.map((item: any) => ({
        id: item.contentDetails.videoId, // Temporary ID, will be replaced by Firestore ID
        youtubeId: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: '0:00',
        viewCount: '0',
        status: 'PUBLISHED'
      }));
    } catch (error) {
      console.error('Error fetching YouTube videos:', error);
      return this.getMockVideos();
    }
  },

  getMockVideos(): Video[] {
    return [
      {
        id: '1',
        youtubeId: 'dQw4w9WgXcQ',
        title: 'Sustainable Farming Techniques for 2026',
        description: 'Learn about the latest in sustainable agriculture and how to implement it on your farm.',
        thumbnail: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800',
        channelTitle: 'AgriTech Official',
        publishedAt: new Date().toISOString(),
        duration: '12:45',
        viewCount: '1.2K',
        category: 'Farming',
        status: 'PUBLISHED'
      },
      {
        id: '2',
        youtubeId: 'dQw4w9WgXcQ',
        title: 'The Future of AgTech: AI and Robotics',
        description: 'Exploring how artificial intelligence and robotics are transforming the agricultural landscape.',
        thumbnail: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
        channelTitle: 'Future Farming',
        publishedAt: new Date().toISOString(),
        duration: '15:20',
        viewCount: '3.5K',
        category: 'Technology',
        status: 'PUBLISHED'
      },
      {
        id: '3',
        youtubeId: 'dQw4w9WgXcQ',
        title: 'Soil Health and Regeneration',
        description: 'A deep dive into soil microbiology and regenerative practices for better yields.',
        thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800',
        channelTitle: 'Soil Science',
        publishedAt: new Date().toISOString(),
        duration: '10:10',
        viewCount: '850',
        category: 'Soil',
        status: 'PUBLISHED'
      }
    ];
  }
};
