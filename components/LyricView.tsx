import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface LyricLine {
    time: number;
    text: string;
}

interface LyricViewProps {
    lyrics: string | null;
    currentTime: number;
    onSeek: (time: number) => void;
}

export const LyricView: React.FC<LyricViewProps> = ({ lyrics, currentTime, onSeek }) => {
    const flatListRef = useRef<FlatList>(null);
    const parsedLyrics = React.useMemo(() => {
        if (!lyrics) return [];
        const lines = lyrics.split('\n');
        const result: LyricLine[] = [];
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const ms = parseInt(match[3]);
                const time = minutes * 60 + seconds + (ms / 1000);
                const text = line.replace(timeRegex, '').trim();
                if (text) result.push({ time, text });
            }
        });
        return result;
    }, [lyrics]);

    const activeIndex = parsedLyrics.findLastIndex(line => line.time <= currentTime);

    useEffect(() => {
        if (activeIndex !== -1 && flatListRef.current) {
            flatListRef.current.scrollToIndex({
                index: activeIndex,
                animated: true,
                viewPosition: 0.5,
            });
        }
    }, [activeIndex]);

    const renderItem = ({ item, index }: { item: LyricLine; index: number }) => {
        const isActive = index === activeIndex;
        return (
            <TouchableOpacity onPress={() => onSeek(item.time)}>
                <Text style={[
                    styles.lyricText,
                    isActive ? styles.activeLyric : styles.inactiveLyric
                ]}>
                    {item.text}
                </Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {parsedLyrics.length > 0 ? (
                <FlatList
                    ref={flatListRef}
                    data={parsedLyrics}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                    onScrollToIndexFailed={() => { }}
                />
            ) : (
                <View style={styles.noLyrics}>
                    <Text style={styles.noLyricsText}>No lyrics available</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    listContent: {
        paddingVertical: 100,
    },
    lyricText: {
        fontSize: 24,
        fontWeight: '700',
        marginVertical: 12,
        textAlign: 'center',
    },
    activeLyric: {
        color: '#ffffff',
        transform: [{ scale: 1.1 }],
    },
    inactiveLyric: {
        color: 'rgba(255, 255, 255, 0.3)',
    },
    noLyrics: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    noLyricsText: {
        color: 'rgba(255, 255, 255, 0.5)',
        fontSize: 16,
    },
});
