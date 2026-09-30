import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated, Dimensions} from 'react-native';
import {Aviso} from '../types';

const COLOR_HEX: Record<Aviso['color'], string> = {
  negro: '#1e293b',
  rojo: '#dc2626',
  amarillo: '#ca8a04',
  verde: '#059669',
};

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AvisosTickerProps {
  avisos: Aviso[];
}

export function AvisosTicker({avisos}: AvisosTickerProps) {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (avisos.length === 0) return;

    const animation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -SCREEN_WIDTH,
        duration: 22000,
        useNativeDriver: true,
      }),
    );

    animation.start();

    return () => animation.stop();
  }, [avisos, scrollX]);

  if (avisos.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay avisos activos</Text>
      </View>
    );
  }

  const renderAvisos = (key: string) => (
    <View key={key} style={styles.avisosGroup}>
      {avisos.map((aviso, i) => (
        <View key={`${key}-${aviso.id}`} style={styles.avisoItem}>
          {i > 0 && <Text style={styles.separator}>•</Text>}
          <Text style={[styles.avisoText, {color: COLOR_HEX[aviso.color] || COLOR_HEX.negro}]}>
            {aviso.texto}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.icon}>🔔</Text>
        <Text style={styles.label}>AVISOS</Text>
      </View>

      <View style={styles.scrollContainer}>
        <Animated.View
          style={[
            styles.scrollContent,
            {
              transform: [{translateX: scrollX}],
            },
          ]}>
          {renderAvisos('a')}
          {renderAvisos('b')}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 80,
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyContainer: {
    height: 80,
    backgroundColor: '#ffffff',
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 20,
    fontWeight: '500',
  },
  labelContainer: {
    padding: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRightWidth: 2,
    borderRightColor: '#e2e8f0',
    height: '100%',
    backgroundColor: '#f8fafc',
  },
  icon: {
    fontSize: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
    letterSpacing: 0.8,
  },
  scrollContainer: {
    flex: 1,
    overflow: 'hidden',
    height: '100%',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  avisosGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: SCREEN_WIDTH * 0.6,
  },
  avisoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    color: '#94a3b8',
    paddingHorizontal: 20,
    fontSize: 28,
  },
  avisoText: {
    fontSize: 24,
    fontWeight: '600',
  },
});
