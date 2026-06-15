import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor} from 'react-native-vision-camera';
import { Worklets } from 'react-native-worklets-core';



export default function DashboardScreen() {
  const router = useRouter();

  const [studying, setStudying] = useState(false);
  const [tempo, setTempo] = useState(0);
  const [chipState, setChipState] = useState<'idle' | 'starting' | 'studying'>('idle');

  const gifStates = {
    idle: require('../../assets/gifs/chipIdle.gif'),
    starting: require('../../assets/gifs/chipStarting.gif'),
    studying: require('../../assets/gifs/chipStudying.gif'),
  };


  const camUser = useCameraDevice('front');
  const camRef = useRef<any>(null);
  const permUser = useCameraPermission();

  const latestFrame = useRef<any>(null);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    console.log(
      frame.width,
      frame.height
    );
  }, []);

  useEffect(() => {
    if (!studying) return;

    const interval = setInterval(() => {
      setTempo(sec => sec + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [studying]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map(unit => String(unit).padStart(2, '0'))
      .join(':');
  }

  const startStudy = () => {
    if (chipState !== 'idle') return;
    setTempo(0);
    setChipState('starting');

    setTimeout(() => {
      setChipState('studying');
      setStudying(true);
    }, 3000); // Alterar se quiser o mudar o tempo de start
  };

  const stopStudy = () => {
    setStudying(false);
    setTempo(0);
    setChipState('idle');
  };
  
  

  return (
    <View style={styles.container}>

      {
        camUser && (
          <Camera
            ref={camRef}
            style={styles.hiddenCamera}
            device={camUser}
            isActive={studying}
            frameProcessor={frameProcessor}
          />
        )
      }
      
      <Modal
        visible={!permUser.hasPermission}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.content}>
              <Text style={styles.title}>Um segundo!</Text>
              <Text style={styles.subtitle}>Ainda não temos a permissão da câmera.</Text>
              <Button 
                title="Permitir"
                onPress={permUser.requestPermission} 
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.content}>
        <Text style={styles.title}>Sessão de Estudo</Text>
        <Text style={styles.timer}>
            {formatTime(tempo)}
        </Text>
      </View>

      <View style={styles.content}>
        <Image
          source={
          gifStates[chipState]
          }
          style={styles.chip}
        />
      </View>
      

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          {studying
            ? 'Sessão em andamento'
            : 'Mantenha o foco durante seus estudos'
          }
        </Text>

        <Button
          title={
            studying
              ? 'Encerrar Sessão'
              : 'Iniciar Sessão'
          }
          onPress={
            studying
              ? stopStudy
              : startStudy
          }
        />
      </View>



      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.accent,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '80%',
    height: '25%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  modalText: {
    marginBottom: 20,
  },
  chip: {
    width: 220,
    height: 220,
    marginBottom: 24,
    resizeMode: 'contain',
  },
  timer: {
    fontFamily: theme.fonts.bold,
    fontSize: 42,
    color: theme.colors.primary,
    marginBottom: 32,
  },
  logoutButton: {
    marginBottom: 40,
  },
  hiddenCamera: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 1
  }
});