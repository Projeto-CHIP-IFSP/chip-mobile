// app/(login)/register.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity // Mantido para o clique do ícone
} from 'react-native';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useRouter } from 'expo-router';

// NOVO: Importando ícones padrão do Expo
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Imports do firebase
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../src/services/firebaseConfig';

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrengthLevel = (pass: string) => {
    if (!pass) return 0;
    if (pass.length < 6) return 1; // Muito Fraca
    
    const hasNumber = /\d/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    const hasUpper = /[A-Z]/.test(pass);

    // Média: tamanho aceitável, mas falta complexidade
    if (pass.length < 8 || !(hasNumber && hasSpecial && hasUpper)) {
      return 2;
    }
    
    return 3;
  };

  const strengthLevel = getPasswordStrengthLevel(password);

  const getStrengthColor = (level: number) => {
    switch (level) {
      case 1: return '#EF4444'; // Vermelho (Fraca)
      case 2: return '#F59E0B'; // Laranja (Média)
      case 3: return '#10B981'; // Verde (Forte)
      default: return '#E5E7EB'; // Cinza claro (Vazio)
    }
  };

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('O e-mail é obrigatório.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Insira um formato de e-mail válido.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('A senha é obrigatória.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('A senha deve ter pelo menos 6 caracteres.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Confirmar sua senha é obrigatório.');
      isValid = false;
    }

    if (password !== confirmPassword) {
      setConfirmError('As senhas não coincidem.');
      isValid = false;
    }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsLoading(false);
      router.replace('/(login)/login');
    } catch (e: any) {
      setIsLoading(false);
      if (e.code === 'auth/email-already-in-use') {
        setEmailError('Esse e-mail já está cadastrado.');
      } else if (e.code === 'auth/weak-password') {
        setPasswordError('A senha é muito fraca.');
      } else {
        setPasswordError('Erro ao criar sua conta.');
      }
    }
  };

  const TogglePasswordIcon = () => (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <MaterialCommunityIcons 
        name={showPassword ? 'eye-off' : 'eye'} 
        size={22} 
        color={theme.colors.gray} 
      />
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Vamos criar sua conta!</Text>
            <Text style={styles.subtitle}>Mas antes precisamos de algumas informações...</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="E-mail"
              placeholder="estudante@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              error={emailError}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
            />

            <Input
              label="Senha"
              placeholder="Preencha com sua senha"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              error={passwordError}
              rightElement={<TogglePasswordIcon />} 
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
            />

            {/* MODIFICADO: Mostrador de força como uma barra segmentada */}
            {password.length > 0 && (
              <View style={styles.strengthBarContainer}>
                {/* Segmento 1: Fraca */}
                <View style={[
                  styles.strengthSegment, 
                  { backgroundColor: strengthLevel >= 1 ? getStrengthColor(strengthLevel) : '#E5E7EB' }
                ]} />
                {/* Segmento 2: Média */}
                <View style={[
                  styles.strengthSegment, 
                  { backgroundColor: strengthLevel >= 2 ? getStrengthColor(strengthLevel) : '#E5E7EB' }
                ]} />
                {/* Segmento 3: Forte */}
                <View style={[
                  styles.strengthSegment, 
                  { backgroundColor: strengthLevel >= 3 ? getStrengthColor(strengthLevel) : '#E5E7EB' }
                ]} />
              </View>
            )}

            <Input
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={confirmPassword}
              error={confirmError}
              rightElement={<TogglePasswordIcon />} 
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError('');
              }}
            />

            <Button 
              title="Cadastrar" 
              onPress={handleRegister} 
              isLoading={isLoading} 
            />

            <Button 
              title="Já possuo uma conta" 
              variant="ghost"
              onPress={() => router.back()}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 47,
  },
  title: {
    fontFamily: theme.fonts.bold,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 8,
    color: theme.colors.text,
  },
  subtitle: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.accent,
    textAlign: 'center',
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  strengthBarContainer: {
    flexDirection: 'row',
    height: 6,
    width: '100%',
    marginBottom: 20,
    marginTop: -10, 
    gap: 4, 
    paddingHorizontal: 4, 
  },
  strengthSegment: {
    flex: 1, 
    borderRadius: 3,
    backgroundColor: '#E5E7EB', 
  },
});