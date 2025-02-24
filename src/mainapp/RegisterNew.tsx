import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import ip from "../ips.json";

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailUser, setEmailUser] = useState('');
  const [serialR,setSerialR] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!username || !password || !emailUser) {
      Alert.alert('Error', 'Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);

    try {
      const fin = {'username':username,'password':password,'email':emailUser,'serial':serialR}
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/register', {fin});

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Registro completado con éxito.');
        navigation.navigate('Login');
      } else {
        console.log(response.data)
        console.log(response)
        Alert.alert('Error', 'Error en el registro.'+error.response.data.Error);
      }
    } catch (error) {
      console.log(error.response.data.Error)
      Alert.alert('Error', 'Error en el registro. '+error.response.data.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Registro</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={emailUser}
          onChangeText={setEmailUser}
          //keyboardType="phone-pad"
        />
      <TextInput
          style={styles.input}
          placeholder="Serial Register"
          value={serialR}
          onChangeText={setSerialR}
          //keyboardType="phone-pad"
        />
        <TouchableOpacity onPress={handleRegister} style={styles.button}>
          <Text style={styles.buttonText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#212121',
  },
  form: {
    width: '80%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#007AFF',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
