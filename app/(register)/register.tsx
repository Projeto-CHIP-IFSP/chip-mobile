import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useRouter } from 'expo-router';

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

  const validateForm = () => {
    let isValid = true;

    setEmailError('');
    setPasswordError('');
    setConfirmError('');

    // Validação de E-mail via Regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('O e-mail é obrigatório.');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Insira um formato de e-mail válido.');
      isValid = false;
    }

    // Verifica senha e confirmação de senha
    if (!password) {
      setPasswordError('A senha é obrigatória.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Confirmar sua senha é obrigatório.');
      isValid = false;
    }

    // Verificam se as senhas são equivalentes
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
      // Tentativa de criar um usuário no firebase
      await createUserWithEmailAndPassword(auth, email, password);
      setTimeout(() => {
        setIsLoading(false);
        router.replace('/(hub)/dashboard');
      }, 1500);
    } catch (e: any) {
      setIsLoading(false);
      
      // No caso de erro, retorna um dos seguintes avisos
      if (e.code === 'auth/email-already-in-use') {
        setEmailError('Esse e-mail já está cadastrado.');
      } else if (e.code === 'auth/weak-password') {
        setPasswordError('A senha é muito fraca.');
      } else {
        setPasswordError('Erro ao criar sua conta.');
      }
    }
  };

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
                if (emailError) setEmailError(''); // Limpa o erro ao digitar
              }}
            />

            <Input
              label="Senha"
              placeholder="Preencha com sua senha"
              secureTextEntry
              autoCapitalize="none"
              value={password}
              error={passwordError}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError(''); // Limpa o erro ao digitar
              }}
            />

            <Input
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              secureTextEntry
              autoCapitalize="none"
              value={confirmPassword}
              error={confirmError}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmError) setConfirmError(''); // Limpa o erro ao digitar
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
});