import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Modal, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "../ips.json";
import { useAuth } from '../context/AuthProvider';

const AdminWelcome = ({ visible, onClose, otrosPaneles, clubInfoPrin }) => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [clubAdminExist, setClubAdminExist] = useState(false);
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [image, setImage] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');

  const CheckClub = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await axios.get('http://' + ip['ips']['elegido'] + '/api/user2/get_club', {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        if (!response.data.error) {
          setClubAdminExist(true);
          console.log("estio locooo")
          console.log(response.data)
          clubInfoPrin(response.data)
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el club:', error);
      return null;
    }
  };

  const SaveNewClub = async () => {
    console.log("aquiiiiiiisdjaskdjbas")
    try {
      const token = await SecureStore.getItemAsync("token");
      const fin = {
        'name':name,
        'descipcionClub':descripcion,
        'tituloLista':adTitle,
        'descripcionLista':adDescription,
        'location':location,
        'imagen':image
      }
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/user2/create_new_club', {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        if (!response.data.error) {
          setClubAdminExist(true);
          onClose()
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el club:', error);
      return null;
    }
  };

  useEffect(() => {
    CheckClub();
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalBackground}
      >
        <View style={styles.modalContent}>
          <Text style={styles.title}>Bienvenido al Panel de Administración</Text>
          {clubAdminExist ? (
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
              <TouchableOpacity style={styles.button} onPress={() => otrosPaneles.clubInfo(true)}>
                <Text style={styles.buttonText}>Información del Club</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => otrosPaneles.manage(true)}>
                <Text style={styles.buttonText}>Gestionar Menú y Stock</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => otrosPaneles.suscribedUsers(true)}>
                <Text style={styles.buttonText}>Usuarios Suscritos</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button} onPress={() => otrosPaneles.clubSet(true)}>
                <Text style={styles.buttonText}>Configuración del Club</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <ScrollView contentContainerStyle={styles.createClubContainer}>
              <Text style={styles.createClubText}>Vamos a crear tu Club!</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre del Club</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nombre del Club"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripcion del Club</Text>
                <TextInput
                  style={styles.input}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Descripcion del club"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Título en Lista</Text>
                <TextInput
                  style={styles.input}
                  value={adTitle}
                  onChangeText={setAdTitle}
                  placeholder="Título en Lista"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Descripción en Lista</Text>
                <TextInput
                  style={styles.input}
                  value={adDescription}
                  onChangeText={setAdDescription}
                  placeholder="Descripción en Lista"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dirección del club(longitud,latitud)</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="Dirección del club"
                  placeholderTextColor="#999"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>URL de la imagen del club</Text>
                <TextInput
                  style={styles.input}
                  value={image}
                  onChangeText={setImage}
                  placeholder="URL de la imagen del club"
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={SaveNewClub}>
                <Text style={styles.buttonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#333333',
    width: '100%',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: '#00FFFF',
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  createClubContainer: {
    width: '100%',
    paddingVertical: 20,
  },
  createClubText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    width: '90%',
    marginBottom: 15,
    alignSelf: 'center',
  },
  input: {
    height: 40,
    borderColor: '#666',
    borderWidth: 1,
    paddingHorizontal: 10,
    color: 'white',
    borderRadius: 5,
    width: '100%',
  },
  inputLabel: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
});

export default AdminWelcome;
