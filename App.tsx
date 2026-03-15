import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { setupPlayer } from './src/services/AudioService';
import { PlaybackService } from './src/services/playbackService';
import NowPlaying from './src/ui/screens/NowPlaying';

const getTrackPlayer = () => {
    try {
        return Platform.OS !== 'web' ? require('react-native-track-player') : null;
    } catch {
        return null;
    }
};

const TrackPlayer = getTrackPlayer();
if (TrackPlayer?.registerPlaybackService) {
    TrackPlayer.registerPlaybackService(() => PlaybackService);
}

export default function App() {
    const [isPlayerReady, setIsPlayerReady] = useState(false);

    useEffect(() => {
        async function init() {
            const isReady = await setupPlayer();
            setIsPlayerReady(isReady);
        }
        init();
    }, []);

    if (!isPlayerReady) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ffffff" />
            </View>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <SafeAreaView style={styles.container}>
                    <NowPlaying />
                </SafeAreaView>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#101010',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#101010',
    },
});
