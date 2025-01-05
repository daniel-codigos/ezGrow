import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import axios from 'axios';
import ip from "../ips.json";
import { useAuth } from '../context/AuthProvider';
import * as SecureStore from 'expo-secure-store';

const ClubSettings = ({ visible, onClose, clubInfoPrin }) => {
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [description, setDescription] = useState('');
  const { user } = useAuth();

  
  const saveEditInfo = async () => {
    console.log("aquiiiiiiisdjaskdjbas")
    try {
      const token = await SecureStore.getItemAsync("token");
      console.log(user)
      const fin = {
        'name':name,
        'descipcionClub':description,
        'tituloLista':adTitle,
        'descripcionLista':adDescription,
        'location':location,
        'imagen':image
      }
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/user2/edit_club', {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        if (!response.data.error) {
          console.log('ready brooo')
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el club:', error);
      return null;
    }
  };


  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Configuración del Club</Text>
          <Text style={{color:'white'}}>Nombre del Club</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={clubInfoPrin.info[0]?.info.name}
            placeholderTextColor="green"
          />
          <Text style={{color:'white'}}>Descripción del Club</Text>
          <TextInput
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            placeholder={clubInfoPrin.info[0]?.info.descipcionClub}
            placeholderTextColor="green"
          />
          <Text style={{color:'white'}}>Título en Lista</Text>
          <TextInput
            style={styles.input}
            value={adTitle}
            onChangeText={setAdTitle}
            placeholder={clubInfoPrin.info[0]?.info.tituloLista}
            placeholderTextColor="green"
          />
          <Text style={{color:'white'}}>Descripción en Lista</Text>
          <TextInput
            style={styles.input}
            value={adDescription}
            onChangeText={setAdDescription}
            placeholder={clubInfoPrin.info[0]?.info.descripcionLista}
            placeholderTextColor="green"
          />
          <Text style={{color:'white'}}>Dirección del club(longitud,latitud)</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder={clubInfoPrin.info[0]?.info.location}
            placeholderTextColor="green"
          />
          <Text style={{color:'white'}}>URL de la imagen del club</Text>
          <TextInput
            style={styles.input}
            value={image}
            onChangeText={setImage}
            placeholder={clubInfoPrin.info[0]?.info.imagen}
            placeholderTextColor="green"
          />
          <TouchableOpacity style={styles.button} onPress={saveEditInfo}>
            <Text style={styles.buttonText}>Guardar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#212121',
    width: '100%',
    height: '100%',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#00FFFF',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: 'white',
    width: '100%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default ClubSettings;
