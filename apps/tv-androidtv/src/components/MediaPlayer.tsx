import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, Image, Animated} from 'react-native';
import Video from 'react-native-video';
import {MediaItem} from '../types';

const DEFAULT_SLIDE_MS = 8000;

interface MediaPlayerProps {
  media: MediaItem[];
  apiUrl: string;
}

export function MediaPlayer({media, apiUrl}: MediaPlayerProps) {
  const [index, setIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (media.length === 0) return;

    const current = media[index];
    const duration =
      current.tipo === 'VIDEO' && current.duracionSegundos
        ? current.duracionSegundos * 1000
        : DEFAULT_SLIDE_MS;

    // Animación de progreso
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start();

    // Timer para cambiar de slide
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setIndex(prev => (prev + 1) % media.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      });
    }, duration);

    return () => clearTimeout(timer);
  }, [index, media, fadeAnim, progressAnim]);

  useEffect(() => {
    setIndex(0);
    fadeAnim.setValue(1);
  }, [media.length, fadeAnim]);

  if (media.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🖼️</Text>
        <Text style={styles.emptyTitle}>Sin contenido multimedia</Text>
        <Text style={styles.emptySubtitle}>
          El administrador puede agregar contenido desde el panel
        </Text>
      </View>
    );
  }

  const item = media[index];
  const src = `${apiUrl}/storage/${item.archivoUrl}`;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mediaContainer, {opacity: fadeAnim}]}>
        {item.tipo === 'VIDEO' ? (
          <Video
            source={{uri: src}}
            style={styles.video}
            resizeMode="contain"
            repeat
            muted
            paused={false}
          />
        ) : (
          <Image source={{uri: src}} style={styles.image} resizeMode="contain" />
        )}
      </Animated.View>

      <View style={styles.controlsContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, {width: progressWidth}]} />
        </View>

        {media.length > 1 && (
          <View style={styles.dotsContainer}>
            {media.map((_, i) => (
              <View
                key={i}
                style={[
                  styles.dot,
                  i === index ? styles.dotActive : styles.dotInactive,
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  emptyContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  emptyIcon: {
    fontSize: 80,
  },
  emptyTitle: {
    fontSize: 26,
    fontWeight: '600',
    color: '#94a3b8',
  },
  emptySubtitle: {
    fontSize: 20,
    color: '#cbd5e1',
  },
  mediaContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 24,
    left: '50%',
    transform: [{translateX: -200}],
    width: 400,
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 20,
    backgroundColor: '#3b82f6',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
});
