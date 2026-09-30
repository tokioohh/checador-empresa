import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface QrDisplayProps {
  token: string;
  apiUrl: string;
}

export function QrDisplay({token, apiUrl}: QrDisplayProps) {
  if (!token) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando QR...</Text>
      </View>
    );
  }

  const qrValue = `${apiUrl}/api/tv/qr?t=${token}`;

  return (
    <View style={styles.container}>
      <View style={styles.qrWrapper}>
        <QRCode value={qrValue} size={260} backgroundColor="#ffffff" color="#1e293b" />
      </View>
      <View style={styles.progressBar}>
        <View style={styles.progressFill} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  qrWrapper: {
    padding: 8,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 3,
  },
  loadingContainer: {
    width: 280,
    height: 280,
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: '500',
  },
});
