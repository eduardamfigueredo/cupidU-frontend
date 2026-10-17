import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// Importação da imagem da logo diretamente com as dimensões exatas definidas no CSS
const logoImg = require('../../assets/images/logo.png');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    console.log('Dados de login:', { email, senha });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* LOGO DO CUPIDU */}
          <View style={styles.logoContainer}>
            <Image
              source={logoImg}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* CARD PRINCIPAL EM ROSA (#E91E63) */}
          <View style={styles.cardContainer}>
            <Text style={styles.title}>Seja bem vindo(a) ao cupidU</Text>
            <Text style={styles.subtitle}>Use seu e-mail institucional da UNAMA</Text>

            {/* Campo E-mail */}
            <View style={styles.inputContainer}>
              <Feather name="user" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e-mail institcional"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Campo Senha */}
            <View style={styles.inputContainer}>
              <Feather name="lock" size={20} color="#666666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="senha"
                placeholderTextColor="#A0A0A0"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />
            </View>

            {/* Links Auxiliares */}
            <View style={styles.linksRow}>
              <TouchableOpacity onPress={() => console.log('Recuperar senha')}>
                <Text style={styles.linkTextUnderline}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <View style={styles.signUpGroup}>
                <Text style={styles.linkText}>Não tem conta? </Text>
                <TouchableOpacity onPress={() => console.log('Navegar para criar conta')}>
                  <Text style={styles.linkTextUnderline}>Criar conta</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Botão Entrar em Vermelho Escuro (#B70E0E) */}
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} activeOpacity={0.85}>
              <Text style={styles.loginButtonText}>Entrar</Text>
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
    backgroundColor: '#FFFFFF', // Fundo principal da aplicação
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 25,
    paddingTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  /* DIMENSÕES EXATAS DA LOGO */
  logoImage: {
    width: 220,  // Largura exata de exibição
    height: 180, // Altura exata de exibição
  },
  cardContainer: {
    backgroundColor: '#E91E63', // Cor Rosa solicitada
    borderRadius: 45,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 28,
    opacity: 0.95,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    width: '100%',
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#333333',
    fontSize: 14,
  },
  linksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 30,
    alignItems: 'center',
  },
  signUpGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  linkTextUnderline: {
    color: '#FFFFFF',
    fontSize: 11,
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#B70E0E', // Cor Vermelha Escura solicitada
    width: '55%',
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});