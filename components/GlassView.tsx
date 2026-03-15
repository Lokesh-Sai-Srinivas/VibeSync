import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

interface GlassViewProps extends ViewProps {
    children?: React.ReactNode;
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    borderRadius?: number;
    style?: ViewStyle | ViewStyle[];
}

export const GlassView: React.FC<GlassViewProps> = ({
    children,
    intensity = 30,
    tint = 'dark',
    borderRadius = 20,
    style,
    ...props
}) => {
    return (
        <View style={[styles.container, { borderRadius }, style]} {...props}>
            <BlurView
                intensity={intensity}
                tint={tint}
                style={[StyleSheet.absoluteFill, { borderRadius }]}
            />
            <View style={[styles.content, { borderRadius }]}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    content: {
        flex: 1,
    },
});
