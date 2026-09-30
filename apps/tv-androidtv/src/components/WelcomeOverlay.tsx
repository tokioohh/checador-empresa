import React, {useEffect, useState, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {TvEvent} from '../types';

const DISPLAY_MS = 6000;

interface WelcomeOverlayProps {
  event: TvEvent | null;
}

export function WelcomeOverlay({event}: WelcomeOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<TvEvent | null>(null);
  const slideAnim = useRef(new Animated.Value(30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!event) return;

    setCurrent(event);
    setVisible(true);

    // Animación de entrada
    slideAnim.setValue(30);
    opacityAnim.setValue(0);

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Timer para ocultar
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 30,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setVisible(false));
    }, DISPLAY_MS);

    return () => clearTimeout(timer);
  }, [event, slideAnim, opacityAnim]);

  if (!visible || !current) return null;

  const isSuccess = current.type === 'asistencia:success';
  const bgColor = isSuccess ? '#10b981' : '#ef4444';
  const icon = isSuccess ? '✓' : '✕';

  const message = isSuccess
    ? current.tipo === 'ENTRADA'
      ? `¡Bienvenido, ${current.empleado.nombre}!`
      : `¡Hasta luego, ${current.empleado.nombre}!`
    : current.error;

  const subMessage = isSuccess
    ? [
        current.empleado.puesto,
        current.tipo === 'ENTRADA' ? 'Entrada registrada' : 'Salida registrada',
      ]
        .filter(Boolean)
        .join(' · ')
    : 'Por favor intenta de nuevo';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacityAnim,
          transform: [{translateY: slideAnim}],
        },
      ]}>
      <View style={[styles.card, {backgroundColor: bgColor}]}>
        <View style={styles.iconContainer}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.message}>{message}</Text>
          <Text style={styles.subMessage}>{subMessage}</Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  card: {
    borderRadius: 20,
    padding: 24,
    paddingHorizontal: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    minWidth: 500,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
  },
  message: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subMessage: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 20,
    marginTop: 4,
    fontWeight: '500',
  },
});
