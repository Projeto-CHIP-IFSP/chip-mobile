import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/constants/theme';
import { Button } from '../../src/components/Button';

export default function DashboardScreen() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Integrar signOut do Firebase futuramente
    // Volta para o login apagando o histórico de navegação
    router.replace('/(login)/login');
  };

  const handleFocus = () => {
    router.push('/(focus)/focus');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Login de Sucesso!</Text>
        <Text style={styles.subtitle}>
          Este é o Hub Principal.
        </Text>
      </View>

      <Button 
        title="Tela de Foco" 
        onPress={handleFocus}
      />

      <Button 
        title="Sair (Logout)" 
        variant="ghost" 
        onPress={handleLogout} 
        style={styles.logoutButton}
      />

      
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
  logoutButton: {
    marginBottom: 40,
  }
});