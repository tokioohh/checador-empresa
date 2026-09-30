import React, {useMemo} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {QrDisplay} from './components/QrDisplay';
import {MediaPlayer} from './components/MediaPlayer';
import {AvisosTicker} from './components/AvisosTicker';
import {WelcomeOverlay} from './components/WelcomeOverlay';
import {useQrToken} from './hooks/useQrToken';
import {useMedia} from './hooks/useMedia';
import {useAvisos} from './hooks/useAvisos';
import {useTvWebSocket} from './hooks/useTvWebSocket';

// Configura esta URL con tu servidor backend
const API_URL = 'http://192.168.1.100:4000'; // Cambia esta IP por la de tu servidor

export default function App() {
  const apiUrl = useMemo(() => API_URL, []);

  const {qrToken} = useQrToken(apiUrl);
  const media = useMedia(apiUrl);
  const avisos = useAvisos(apiUrl);
  const {lastEvent} = useTvWebSocket(apiUrl);

  return (
    <View style={styles.container}>
      <AvisosTicker avisos={avisos} />

      <View style={styles.mainContent}>
        <View style={styles.mediaContainer}>
          <MediaPlayer media={media} apiUrl={apiUrl} />
        </View>

        <View style={styles.sidebarContainer}>
          <View style={styles.qrCard}>
            <View style={styles.qrHeader}>
              <Text style={styles.qrTitle}>Escanea para registrar</Text>
            </View>
            <QrDisplay token={qrToken} apiUrl={apiUrl} />
            <View style={styles.qrFooter}>
              <Text style={styles.qrInstructions}>
                Usa tu huella digital{'\n'}para confirmar
              </Text>
            </View>
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>¿Cómo funciona?</Text>
            <Text style={styles.instructionsText}>
              1. Abre la app en tu teléfono{'\n'}
              2. Escanea el código QR{'\n'}
              3. Confirma con tu huella
            </Text>
          </View>
        </View>
      </View>

      <WelcomeOverlay event={lastEvent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
    padding: 32,
    gap: 32,
  },
  mediaContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  sidebarContainer: {
    width: 360,
    gap: 24,
  },
  qrCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    padding: 32,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  qrHeader: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  qrFooter: {
    alignItems: 'center',
  },
  qrInstructions: {
    fontSize: 18,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  instructionsCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#bbf7d0',
    padding: 28,
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#166534',
  },
  instructionsText: {
    fontSize: 18,
    color: '#15803d',
    lineHeight: 32,
    fontWeight: '500',
  },
});
