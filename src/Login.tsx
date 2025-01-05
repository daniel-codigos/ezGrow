/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import React, { useState } from 'react';
import { useAuth } from './context/AuthProvider';
import { useNavigation } from '@react-navigation/native';
import ip from "./ips.json"
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, Image } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const { login } = useAuth();

  const handleLogin = async (saveLogin) => {
    console.log("Intentando iniciar sesión con:", username, password);
    setLoading(true);
    try {
      const success = await login(username, password);
      console.log("Resultado del login:", success);
      //saveLogin(success)
      if (success) {
        console.log("Inicio de sesión exitoso");
      } else {
        console.log("Error en el inicio de sesión");
      }
    } catch (error) {
      console.error("Error durante el manejo de inicio de sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  const registerNew = () => {
    navigation.navigate('Register');
  }

  return (
    <View style={styles.container}>
      <Image source={require('./assets/robot.png')} style={styles.logo} />
      <TextInput
        style={styles.input}
        placeholder="Usuario"
        placeholderTextColor="#ccc"
        value={username}
        onChangeText={(text) => setUsername(text)}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        placeholderTextColor="#ccc"
        value={password}
        onChangeText={(text) => setPassword(text)}
        secureTextEntry
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.signupButton} onPress={registerNew}>
        <Text style={styles.signupButtonText}>Crear cuenta nueva</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 32,
  },
  input: {
    width: '100%',
    fontSize: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dddfe2',
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: '#f5f6f7',
  },
  loginButton: {
    width: '100%',
    backgroundColor: '#1877f2',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 16,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: '#1877f2',
    fontSize: 14,
  },
  signupButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
    borderColor: '#1877f2',
    borderWidth: 1,
  },
  signupButtonText: {
    color: '#1877f2',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
