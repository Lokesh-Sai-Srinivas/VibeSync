import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export const useDominantColor = (imageUrl: string | undefined) => {
    const [colors, setColors] = useState<{
        primary: string;
        secondary: string;
        background: string;
    }>({
        primary: '#121212',
        secondary: '#1ed760',
        background: '#121212',
    });

    useEffect(() => {
        if (!imageUrl || Platform.OS === 'web') return;

        const fetchColors = async () => {
            try {
                // Dynamically require to prevent top-level native module access crash
                const ImageColors = require('react-native-image-colors');
                const getColors = ImageColors.getColors;

                if (!getColors) return;

                const result = await getColors(imageUrl, {
                    fallback: '#121212',
                    cache: true,
                    key: imageUrl,
                });

                if (result.platform === 'android' || result.platform === 'web') {
                    setColors({
                        primary: result.vibrant || result.dominant || '#121212',
                        secondary: result.average || '#1ed760',
                        background: result.darkVibrant || '#121212',
                    });
                } else if (result.platform === 'ios') {
                    setColors({
                        primary: result.primary || '#121212',
                        secondary: result.secondary || '#1ed760',
                        background: result.detail || '#121212',
                    });
                }
            } catch (e) {
                console.warn('Error fetching image colors (likely missing native module):', e);
            }
        };

        fetchColors();
    }, [imageUrl]);

    return colors;
};
