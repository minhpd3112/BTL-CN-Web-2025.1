import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY || '';
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

interface YouTubeVideo {
    videoId: string;
    title: string;
    description: string;
    thumbnail: string;
    channelTitle: string;
    url: string;
}

export const youtubeService = {
    /**
     * Search for YouTube videos based on a query
     */
    searchVideos: async (query: string, maxResults: number = 5): Promise<YouTubeVideo[]> => {
        try {
            const response = await axios.get(YOUTUBE_API_URL, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults,
                    key: YOUTUBE_API_KEY,
                    videoEmbeddable: true,
                    relevanceLanguage: 'vi', // Prefer Vietnamese content
                },
            });

            const items = response.data.items || [];

            return items.map((item: any) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                description: item.snippet.description,
                thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
                channelTitle: item.snippet.channelTitle,
                url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            }));
        } catch (error: any) {
            console.error('YouTube search error:', error.response?.data || error.message);
            throw new Error(`Failed to search YouTube: ${error.message}`);
        }
    },

    /**
     * Get the first matching video for a search query
     */
    getFirstVideo: async (query: string): Promise<YouTubeVideo | null> => {
        const videos = await youtubeService.searchVideos(query, 1);
        return videos.length > 0 ? videos[0] : null;
    },

    /**
     * Search and get video URLs for multiple queries
     */
    searchMultipleQueries: async (queries: string[]): Promise<Map<string, string>> => {
        const results = new Map<string, string>();

        for (const query of queries) {
            try {
                const video = await youtubeService.getFirstVideo(query);
                if (video) {
                    results.set(query, video.url);
                }
            } catch (error) {
                console.error(`Failed to find video for query: ${query}`);
            }
        }

        return results;
    },
};

export default youtubeService;
