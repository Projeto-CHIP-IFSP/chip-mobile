import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Camera, useCameraDevice, useCameraPermission, useFrameProcessor} from 'react-native-vision-camera';
import { Worklets, useSharedValue } from 'react-native-worklets-core';
import { useResizePlugin } from 'vision-camera-resize-plugin'
import { useTensorflowModel } from 'react-native-fast-tflite';
import { NitroModules } from 'react-native-nitro-modules';
import { scanFaces } from 'vision-camera-face-detector-v4-expo53';




export default function DashboardScreen() {
  const router = useRouter();

  const [debugText, setDebugText] = useState('');
  const updateDebug = Worklets.createRunOnJS(
    (text: string) => {
      setDebugText(text);
    }
  );

  useEffect(() => {
    setDebugText('APP INICIOU');
  }, []);

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

  const emotion =
    emotionModel.state === 'loaded'
      ? emotionModel.model
      : undefined;

  const boxedEmotionModel = useMemo(
    () => (emotion ? NitroModules.box(emotion) : undefined),
    [emotion]
  );

  
  const lastUpdate = useSharedValue(0);

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    const now = Date.now();

    if (now - lastUpdate.value < 1000) {
      return;
    }

    lastUpdate.value = now;

    const result = scanFaces(frame, {
      performanceMode: 'fast',
      landmarkMode: 'all',
      classificationMode: 'all',
    });

    if (!result.faces) {
      updateDebug('SEM ROSTO');
      return;
    }

    const faces = JSON.parse(result.faces);

    if (!faces || faces.length === 0) {
      updateDebug('SEM ROSTO');
      return;
    }

    const face = faces[0];

    /*updateDebug(`
    TESTE DO FACE DETECTOR
    Smile: ${face.smilingProbability?.toFixed(2)}

    Left Eye:
    ${face.leftEyeOpenProbability?.toFixed(2)}

    Yaw:
    ${face.yawAngle?.toFixed(1)}

    Pitch:
    ${face.pitchAngle?.toFixed(1)}

    X:
    ${face.bounds.x.toFixed(0)}

    Y:
    ${face.bounds.y.toFixed(0)}

    W:
    ${face.bounds.width.toFixed(0)}

    H:
    ${face.bounds.height.toFixed(0)}
    `); */

    if ( boxedEmotionModel == null) return;

    const emotionTflite = boxedEmotionModel.unbox();

    const emotionInput = resize(frame, {
      crop: {
        x: Math.max(0, Math.floor(face.bounds.x)),
        y: Math.max(0, Math.floor(face.bounds.y)),
        width: Math.floor(face.bounds.width),
        height: Math.floor(face.bounds.height),
      },
      scale: {
        width: 224,
        height: 224,
      },
      pixelFormat: 'rgb',
      dataType: 'float32',
    });



    const emotionBuffer = emotionInput.buffer.slice(
      emotionInput.byteOffset,
      emotionInput.byteOffset + emotionInput.byteLength
    );

    const emotionOutputs = emotionTflite.runSync([
      emotionBuffer
    ]);

    const sample = new Float32Array(
      emotionBuffer
    );

    const probs = new Float32Array(emotionOutputs[0]);

    const emotions = [
      'Angry',
      'Disgust',
      'Fear',
      'Happy',
      'Neutral',
      'Sad',
      'Surprise'
    ];

    let best = 0;

    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[best]) {
        best = i;
      }
    }
    
    updateDebug(`
    TESTE DE EMOCAO
    ${emotions[best]}
    ${(probs[best] * 100).toFixed(1)}%

    A ${(probs[0] * 100).toFixed(1)}
    D ${(probs[1] * 100).toFixed(1)}
    F ${(probs[2] * 100).toFixed(1)}
    H ${(probs[3] * 100).toFixed(1)}
    N ${(probs[4] * 100).toFixed(1)}
    S ${(probs[5] * 100).toFixed(1)}
    SU ${(probs[6] * 100).toFixed(1)}
    `);

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