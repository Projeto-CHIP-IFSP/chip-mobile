import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor} from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin';
import { useTensorflowModel } from 'react-native-fast-tflite';
import { NitroModules } from 'react-native-nitro-modules';
import { scanFaces } from 'vision-camera-face-detector-v4-expo53';

export default function DashboardScreen() {
  const router = useRouter();

  const [debugText, setDebugText] = useState('APP INICIOU');
  const updateDebug = Worklets.createRunOnJS((text: string) => {
    setDebugText(text);
  });

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

  const { resize } = useResizePlugin();

  const emotionModel = useTensorflowModel(
    require('../../assets/tf-models/model_v1.tflite'),
    []
  );

  const emotion = emotionModel.state === 'loaded' ? emotionModel.model : undefined;
  const boxedEmotionModel = useMemo(() => (emotion ? NitroModules.box(emotion) : undefined), [emotion]);

  const lastUpdate = useSharedValue(0);
  const votingWindow = useSharedValue<number[]>([]);
  const BUFFER_SIZE = 10;

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    if (boxedEmotionModel == null) return;

    const now = Date.now();
    // Throttle ajustado para permitir uma leitura fluida sem travar o React
    if (now - lastUpdate.value < 350) {
      return;
    }

    const result = scanFaces(frame, {
      performanceMode: 'fast',
      landmarkMode: 'none',
      classificationMode: 'none',
    });

    if (!result.faces) {
      updateDebug('🤖 CHIP AI\nNenhum rosto detectado');
      return;
    }

    const faces = JSON.parse(result.faces);

    if (!faces || faces.length === 0) {
      updateDebug('🤖 CHIP AI\nNenhum rosto detectado');
      return;
    }

    const face = faces[0];
    lastUpdate.value = now;

    // 1. CROP ESTABILIZADO (Margem de 40%)
    // Dá ao modelo contexto do cenário para ele não se perder na proximidade extrema
    const frameW = frame.width;
    const frameH = frame.height;
    const margin = 0.40;
    
    const faceW = face.bounds.width;
    const faceH = face.bounds.height;
    const mx = faceW * margin;
    const my = faceH * margin;

    const rawStartX = face.bounds.x - mx;
    const rawStartY = face.bounds.y - my;
    const rawEndX = face.bounds.x + faceW + mx;
    const rawEndY = face.bounds.y + faceH + my;

    const startX = Math.max(0, Math.min(frameW - 1, Math.floor(rawStartX)));
    const startY = Math.max(0, Math.min(frameH - 1, Math.floor(rawStartY)));
    const endX = Math.max(startX + 1, Math.min(frameW, Math.floor(rawEndX)));
    const endY = Math.max(startY + 1, Math.min(frameH, Math.floor(rawEndY)));

    const emotionInput = resize(frame, {
      crop: {
        x: startX,
        y: startY,
        width: endX - startX,
        height: endY - startY,
      },
      scale: { width: 224, height: 224 },
      pixelFormat: 'rgb',
      dataType: 'float32',
    });

    // 2. EXTRAÇÃO NATIVA SEM NORMALIZAÇÃO MANUAL
    // Exatamente a lógica que o modelo aceitou no seu teste original
    const emotionBuffer = emotionInput.buffer.slice(
      emotionInput.byteOffset,
      emotionInput.byteOffset + emotionInput.byteLength
    );

    const emotionTflite = boxedEmotionModel.unbox();
    const emotionOutputs = emotionTflite.runSync([emotionBuffer]);
    const probs = new Float32Array(emotionOutputs[0]);

    let best = 0;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[best]) {
        best = i;
      }
    }
    
    // 3. JANELA DE VOTAÇÃO (FILTRO TEMPORAL)
    // Impede que o robô troque de estado freneticamente a cada piscar de olhos
    const currentWindow = [...votingWindow.value];
    currentWindow.push(best);
    if (currentWindow.length > BUFFER_SIZE) {
      currentWindow.shift();
    }
    votingWindow.value = currentWindow;

    const counts = [0, 0, 0, 0, 0, 0, 0];
    let mostFrequentIdx = best;
    let maxCount = 0;

    for (let i = 0; i < currentWindow.length; i++) {
      const idx = currentWindow[i];
      counts[idx]++;
      if (counts[idx] > maxCount) {
        maxCount = counts[idx];
        mostFrequentIdx = idx;
      }
    }

    const emotions = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];
    const CHIP_STATES_MAP = ['Frustração', 'Desconforto', 'Tensão', 'Motivado', 'Foco', 'Cansaço', 'Distração'];

    updateDebug(`🤖 CHIP AI STATUS
Cru: ${emotions[best]} (${(probs[best] * 100).toFixed(1)}%)
-----------------
ESTABILIZADO: ${CHIP_STATES_MAP[mostFrequentIdx]}
Precisão da Janela: ${((maxCount / currentWindow.length) * 100).toFixed(0)}%`);

  }, [boxedEmotionModel, resize]);

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
    }, 3000);
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
            photo={true}
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

      <View
        style={{
          position: 'absolute',
          top: 120,
          left: 10,
          right: 10,
          zIndex: 9999,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 10,
        }}
      >
        <Text
          style={{
            color: 'lime',
            fontSize: 14,
          }}
        >
          {debugText}
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
    width: 80,
    height: 80,
  }
});