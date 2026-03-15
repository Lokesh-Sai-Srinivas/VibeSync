import axios from 'axios';

export const SpotifyParser = {
    parsePlaylist: async (url: string) => {
        try {
            const response = await axios.get(url);
            const html = response.data;

            // Basic extraction of tracks from Spotify's public HTML
            // Note: This is fragile and depends on Spotify's HTML structure
            // A more robust way would be using a dedicated scraper API or OEmbed if sufficient

            const tracks: { title: string; artist: string }[] = [];

            // Regex to find track titles and artists in Spotify's JSON-LD or meta tags
            // This is a simplified example
            const trackRegex = /"name":"(.*?)"/g;
            const artistRegex = /"artistName":"(.*?)"/g;

            // In a real scenario, we'd parse the JSON from the script tags
            const jsonMatch = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s);
            if (jsonMatch) {
                const data = JSON.parse(jsonMatch[1]);
                if (data['@type'] === 'MusicPlaylist') {
                    return data.track.map((t: any) => ({
                        title: t.name,
                        artist: t.byArtist.name,
                    }));
                }
            }

            return tracks;
        } catch (error) {
            console.error('Spotify parse error:', error);
            return [];
        }
    }
};
