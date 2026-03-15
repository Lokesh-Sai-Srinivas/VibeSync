import axios from 'axios';

// ─────────────────────────────────────────────
//  Instance pools (tried in order until one works)
// ─────────────────────────────────────────────

/** JioSaavn mirrors — primary source for Indian & international music */
const SAAVN_INSTANCES = [
    'https://saavn.dev',
    'https://jiosaavn-api-v3.vercel.app',
    'https://saavn.me',
    'https://jiosaavn-api-beta.vercel.app',
    'https://jiosaavn-api-v2.vercel.app',
];

/** Piped (YouTube audio proxy) — fallback for songs not on Saavn */
const PIPED_INSTANCES = [
    'https://pipedapi.kavin.rocks',
    'https://api.piped.video',
    'https://piped-api.hostux.net',
    'https://pipedapi.silkky.cloud',
    'https://pipedapi.moomoo.me',
];

/** Invidious (YouTube proxy) — final fallback after Piped */
const INVIDIOUS_INSTANCES = [
    'https://inv.nadeko.net',
    'https://invidious.fdn.fr',
    'https://invidious.projectsegfau.lt',
    'https://y.com.sb',
];

const LASTFM_API_KEY = '3878f1e0dfea9f4026e7e444ac30a673';

const API_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
};

const TIMEOUT_MS = 6000;

// ─────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────

export interface SongMetadata {
    id: string;
    title: string;
    artist: string;
    album: string;
    artwork: string;
    duration: number;
    url?: string;
    /** If this track came from Saavn, store the Saavn song ID for direct stream lookup */
    saavnId?: string;
}

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────

/** Pick the best artwork from a Saavn image array */
const saavnArtwork = (images: any[]): string => {
    if (!Array.isArray(images)) return 'https://via.placeholder.com/300';
    const hd = images.find((img: any) => img.quality === '500x500') || images[images.length - 1];
    return hd?.link || hd?.url || 'https://via.placeholder.com/300';
};

/** Normalize a Saavn song object → SongMetadata */
const normalizeSaavnSong = (item: any): SongMetadata => ({
    id: item.id || Math.random().toString(36).substr(2, 9),
    saavnId: item.id,
    title: item.name || item.title || 'Unknown',
    artist:
        (Array.isArray(item.artists?.primary)
            ? item.artists.primary.map((a: any) => a.name).join(', ')
            : item.primaryArtists || item.artist || item.subtitle) || 'Unknown',
    album: item.album?.name || item.album || 'Unknown',
    artwork: saavnArtwork(item.image),
    duration: parseInt(item.duration) || 0,
});

// ─────────────────────────────────────────────
//  Main API object
// ─────────────────────────────────────────────

export const MusicAPI = {

    // ── Search ──────────────────────────────

    searchJioSaavn: async (query: string): Promise<SongMetadata[]> => {
        const paths = ['/api/search/songs', '/api/search', '/search/songs'];

        for (const base of SAAVN_INSTANCES) {
            for (const path of paths) {
                try {
                    const res = await axios.get(`${base}${path}`, {
                        params: { query, limit: 20 },
                        headers: API_HEADERS,
                        timeout: TIMEOUT_MS,
                    });
                    const raw = res.data?.data || res.data;
                    const songs: any[] =
                        raw?.results || raw?.songs?.results || (Array.isArray(raw) ? raw : []);

                    if (songs.length > 0) return songs.map(normalizeSaavnSong);
                } catch {
                    continue;
                }
            }
        }

        // Last.fm tag fallback — metadata only (no streams)
        console.warn('All Saavn search instances failed — falling back to Last.fm metadata');
        try {
            const res = await axios.get('https://ws.audioscrobbler.com/2.0/', {
                params: { method: 'tag.getTopTracks', tag: query, api_key: LASTFM_API_KEY, format: 'json', limit: 20 },
                headers: API_HEADERS,
                timeout: TIMEOUT_MS,
            });
            const tracks: any[] = res.data?.tracks?.track || [];
            return tracks.map((item: any) => ({
                id: 'lfm_' + (item.mbid || Math.random().toString(36).substr(2, 9)),
                title: item.name || 'Unknown',
                artist: item.artist?.name || 'Unknown',
                album: 'Unknown',
                artwork: item.image?.[2]?.['#text'] || 'https://via.placeholder.com/300',
                duration: parseInt(item.duration) || 0,
            }));
        } catch {
            return [];
        }
    },

    getSimilarTracks: async (title: string, artist: string): Promise<SongMetadata[]> => {
        try {
            const res = await axios.get('https://ws.audioscrobbler.com/2.0/', {
                params: { method: 'track.getSimilar', artist, track: title, api_key: LASTFM_API_KEY, format: 'json', limit: 10 },
                headers: API_HEADERS,
                timeout: TIMEOUT_MS,
            });
            return (res.data.similartracks?.track || []).map((item: any) => ({
                id: 'lfm_' + Math.random().toString(36).substr(2, 9),
                title: item.name,
                artist: item.artist?.name || 'Unknown',
                album: 'Unknown',
                artwork: item.image?.[2]?.['#text'] || 'https://via.placeholder.com/300',
                duration: 0,
            }));
        } catch {
            return [];
        }
    },

    // ── Stream URL Resolution ────────────────
    //
    //  Priority order:
    //  1. JioSaavn 320kbps direct link (fastest, most stable)
    //  2. Piped audio stream (YouTube proxy, 5 instances)
    //  3. Invidious formatStreams (older YouTube proxy, 4 instances)

    getStreamUrl: async (track: SongMetadata): Promise<string | null> => {
        const id = track.saavnId || (track.id.startsWith('lfm_') ? null : track.id);

        // ── 1. JioSaavn direct audio ─────────
        if (id && !id.startsWith('lfm_')) {
            const url = await MusicAPI._getSaavnStream(id, track.title, track.artist);
            if (url) return url;
        }

        // ── 2. YouTube via Piped ─────────────
        console.log(`Saavn stream failed for "${track.title}", trying Piped…`);
        const ytUrl = await MusicAPI._getPipedStream(track.title, track.artist);
        if (ytUrl) return ytUrl;

        // ── 3. YouTube via Invidious ─────────
        console.log(`Piped failed, trying Invidious…`);
        return await MusicAPI._getInvidiousStream(track.title, track.artist);
    },

    /** INTERNAL: Fetch JioSaavn 320kbps stream for a known Saavn song ID */
    _getSaavnStream: async (songId: string, title: string, artist: string): Promise<string | null> => {
        for (const base of SAAVN_INSTANCES) {
            try {
                // First try by ID
                const res = await axios.get(`${base}/api/songs/${songId}`, {
                    headers: API_HEADERS,
                    timeout: TIMEOUT_MS,
                });
                const songData = res.data?.data?.[0] || res.data?.data || res.data;
                const urls: any[] = songData?.downloadUrl || songData?.download_url || [];

                // Prefer 320kbps, fall back to highest available
                const best =
                    urls.find((u: any) => u.quality === '320kbps') ||
                    urls.find((u: any) => u.quality === '160kbps') ||
                    urls[urls.length - 1];

                if (best?.link || best?.url) return best.link || best.url;
            } catch {
                continue;
            }
        }

        // If ID lookup fails, try searching by title+artist on Saavn and grabbing stream
        for (const base of SAAVN_INSTANCES) {
            try {
                const res = await axios.get(`${base}/api/search/songs`, {
                    params: { query: `${title} ${artist}`, limit: 1 },
                    headers: API_HEADERS,
                    timeout: TIMEOUT_MS,
                });
                const raw = res.data?.data || res.data;
                const songs: any[] = raw?.results || raw?.songs?.results || [];
                if (songs.length === 0) continue;

                const urls: any[] = songs[0]?.downloadUrl || songs[0]?.download_url || [];
                const best =
                    urls.find((u: any) => u.quality === '320kbps') ||
                    urls.find((u: any) => u.quality === '160kbps') ||
                    urls[urls.length - 1];

                if (best?.link || best?.url) return best.link || best.url;
            } catch {
                continue;
            }
        }
        return null;
    },

    /** INTERNAL: Search Piped for a YouTube video ID, then fetch its audio stream */
    _getPipedStream: async (title: string, artist: string): Promise<string | null> => {
        const q = encodeURIComponent(`${title} ${artist} audio`);

        for (const instance of PIPED_INSTANCES) {
            try {
                // Step 1: Search
                const searchRes = await axios.get(`${instance}/search?q=${q}&filter=music_songs`, {
                    headers: API_HEADERS,
                    timeout: TIMEOUT_MS,
                });
                const video = searchRes.data?.items?.find((v: any) => v.type === 'stream' || v.url);
                if (!video) continue;

                const videoId = video.url?.replace('/watch?v=', '') || video.url?.split('/').pop();
                if (!videoId) continue;

                // Step 2: Fetch audio streams
                const streamRes = await axios.get(`${instance}/streams/${videoId}`, {
                    headers: API_HEADERS,
                    timeout: TIMEOUT_MS,
                });
                const streams: any[] = streamRes.data?.audioStreams || [];

                // Prefer M4A > opus, highest bitrate
                const best =
                    streams.find((s: any) => s.format === 'M4A') ||
                    streams.find((s: any) => s.codec?.includes('opus')) ||
                    streams.find((s: any) => s.mimeType?.includes('audio')) ||
                    streams[0];

                if (best?.url) return best.url;
            } catch {
                continue;
            }
        }
        return null;
    },

    /** INTERNAL: Invidious formatStreams fallback */
    _getInvidiousStream: async (title: string, artist: string): Promise<string | null> => {
        const q = encodeURIComponent(`${title} ${artist}`);

        for (const instance of INVIDIOUS_INSTANCES) {
            try {
                // Step 1: Search
                const searchRes = await axios.get(`${instance}/api/v1/search?q=${q}&type=video`, {
                    headers: API_HEADERS,
                    timeout: TIMEOUT_MS,
                });
                const videoId = searchRes.data?.[0]?.videoId;
                if (!videoId) continue;

                // Step 2: Fetch video details with formatStreams (direct audio)
                const videoRes = await axios.get(`${instance}/api/v1/videos/${videoId}`, {
                    headers: API_HEADERS,
                    timeout: TIMEOUT_MS,
                });

                const formats: any[] = videoRes.data?.adaptiveFormats || videoRes.data?.formatStreams || [];
                const audioOnly = formats.filter((f: any) => f.type?.includes('audio') || !f.qualityLabel);

                const best =
                    audioOnly.find((f: any) => f.type?.includes('mp4')) ||
                    audioOnly.find((f: any) => f.type?.includes('webm')) ||
                    audioOnly[0];

                if (best?.url) return best.url;
            } catch {
                continue;
            }
        }
        return null;
    },

    // ── Lyrics ───────────────────────────────

    getLyrics: async (title: string, artist: string): Promise<string | null> => {
        try {
            const res = await axios.get('https://lrclib.net/api/get', {
                params: { track_name: title, artist_name: artist },
                headers: API_HEADERS,
                timeout: TIMEOUT_MS,
            });
            return res.data?.syncedLyrics || res.data?.plainLyrics || null;
        } catch {
            return null;
        }
    },
};
