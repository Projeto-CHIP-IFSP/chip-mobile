import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Camera, useCameraDevice, useCameraPermission} from 'react-native-vision-camera';

export default function CamTeste() {
  const camUser = useCameraDevice('front');
  const permUser = useCameraPermission();

  if (!permUser.hasPermission) {
    return (
      <View style={styles.content}>
        <Text style={styles.subtitle}>Precisamos da permissão da câmera!</Text>

        <Button 
          title="Permitir" 
          onPress={permUser.requestPermission} 
        />
      </View>
    );
  }

  if (camUser == null) {
    return (
      <View style={styles.content}>
        <Text>Carregando câmera...</Text>
      </View>
    );
  }

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={camUser}
      isActive={true}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.accent,
    textAlign: 'center',
  }
});