import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function VerificacaoScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<any>([]);

  const handleChangeText = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerificar = () => {
    router.push('/completar-perfil');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="arrow-left" size={24} color="#000000" />
          </TouchableOpacity>

          <Text style={styles.title}>Verificação de código</Text>

          <View style={styles.iconContainer}>
            <Feather name="mail" size={64} color="#000000" />
          </View>

          <Text style={styles.subtitle}>
            Enviamos um código de 6 dígitos para{'\n'}seu e-mail institucional
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                style={styles.otpCircle}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChangeText(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                selectTextOnFocus
              />
            ))}
          </View>

          <Text style={styles.timerText}>Reenviar código em 00:45</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleVerificar} activeOpacity={0.85}>
              <Text style={styles.buttonText}>verificar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 30,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 35,
    lineHeight: 20,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 25,
  },
  otpCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  timerText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#4A0E17',
    width: '70%',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
});