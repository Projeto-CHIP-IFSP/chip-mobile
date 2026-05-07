// src/components/Input.tsx
import React, { ReactNode } from 'react'; // Import ReactNode
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { theme } from '../constants/theme';

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  rightElement?: ReactNode; 
}

export function Input({ label, error, rightElement, ...rest }: InputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View style={[
        styles.inputWrapper,
        error ? styles.inputError : null
      ]}>
        <TextInput
          style={styles.input}
          placeholderTextColor={theme.colors.gray}
          {...rest}
        />
        {rightElement && (
          <View style={styles.iconContainer}>
            {rightElement}
          </View>
        )}
      </View>
      
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontFamily: theme.fonts.medium,
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: theme.colors.white,
    borderWidth: 2,
    borderColor: theme.colors.secondary,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center', 
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
  },
  iconContainer: {
    paddingRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputError: {
    borderColor: '#e74c3c',
  },
  errorText: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 6,
    marginLeft: 4,
  }
});