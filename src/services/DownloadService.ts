import * as FileSystem from 'expo-file-system';
import { SongMetadata } from './MusicAPI';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory}downloads/`;

export const DownloadService = {
    init: async () => {
        const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
        }
    },

    downloadTrack: async (track: SongMetadata, streamUrl: string) => {
        const fileUri = `${DOWNLOAD_DIR}${track.id}.mp3`;
        const metadataUri = `${DOWNLOAD_DIR}${track.id}.json`;

        try {
            const downloadResumable = FileSystem.createDownloadResumable(
                streamUrl,
                fileUri,
                {},
                (downloadProgress) => {
                    const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                    console.log(`Download progress: ${progress * 100}%`);
                }
            );

            const result = await downloadResumable.downloadAsync();
            if (result) {
                // Save metadata
                await FileSystem.writeAsStringAsync(metadataUri, JSON.stringify(track));
                return result.uri;
            }
        } catch (e) {
            console.error('Download error:', e);
            return null;
        }
    },

    getOfflineTrack: async (trackId: string) => {
        const fileUri = `${DOWNLOAD_DIR}${trackId}.mp3`;
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        return fileInfo.exists ? fileUri : null;
    },

    deleteOfflineTrack: async (trackId: string) => {
        const fileUri = `${DOWNLOAD_DIR}${trackId}.mp3`;
        const metadataUri = `${DOWNLOAD_DIR}${trackId}.json`;
        await FileSystem.deleteAsync(fileUri, { idempotent: true });
        await FileSystem.deleteAsync(metadataUri, { idempotent: true });
    }
};
