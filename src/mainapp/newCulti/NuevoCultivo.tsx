import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, Button, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "../../ips.json";

export default function NuevoCulti() {
  const [nombreCultivo, setNombreCultivo] = useState('');
  const [guardarDatosAntiguo, setGuardarDatosAntiguo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;

  const handleGuardarDatosToggle = () => {
    setGuardarDatosAntiguo(!guardarDatosAntiguo);
  };

  const empezarNuevoCultivo = async () => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const data = {
        space: espacioName,
        nombreCultivo,
        guardarDatosAntiguo,
      };

      // Simulación de la llamada a la API con la nueva información
      const response = await axios.post(
        `http://${ip.ips.elegido}/api/pages/nuevo_cultivo`,
        data,
        {
          headers: { Authorization: `Bearer ${String(JSON.parse(token).access)}` },
        }
      );

      if (response.status === 200) {
        // Lógica adicional si la API responde correctamente
        setCargando(false);
        navigation.goBack(); // Navegar hacia atrás después de guardar
      } else {
        setCargando(false);
      }
    } catch (error) {
      console.error('Error al iniciar el nuevo cultivo:', error);
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Empezar Nuevo Cultivo</Text>

      {/* Campo de texto para el nombre del nuevo cultivo */}
      <TextInput
        style={styles.input}
        placeholder="Nombre del Nuevo Cultivo"
        value={nombreCultivo}
        onChangeText={setNombreCultivo}
      />

      {/* Opción de guardar datos del cultivo antiguo */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>¿Guardar datos del antiguo cultivo?</Text>
        <TouchableOpacity
          style={[styles.toggleButton, guardarDatosAntiguo ? styles.toggleButtonActive : null]}
          onPress={handleGuardarDatosToggle}
        >
          <Text style={styles.toggleText}>{guardarDatosAntiguo ? 'Sí' : 'No'}</Text>
        </TouchableOpacity>
      </View>

      {/* Botón para empezar nuevo cultivo */}
      <Button title="Empezar Nuevo Cultivo" onPress={empezarNuevoCultivo} disabled={cargando} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  toggleButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    color: '#333',
    fontWeight: 'bold',
  },
});
