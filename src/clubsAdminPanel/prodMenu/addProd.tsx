import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput, Alert, Modal, Text, View } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { Picker } from '@react-native-picker/picker'; // Importa el componente Picker
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "../../ips.json";

const AddProd = ({ visible, onClose , data}) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('Flores'); // Establece una categoría predeterminada
  const [stock, setStock] = useState('');
  const [imageUri, setImageUri] = useState(null);


  const pickImage = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
    };

    launchImageLibrary(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.error) {
        console.log('ImagePicker Error: ', response.error);
      } else {
        const source = { uri: response.assets[0].uri };
        setImageUri(source);
      }
    });
  };

  const add_prod = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const formData = new FormData();
      formData.append('nombre', name);
      formData.append('descripcion', descripcion);
      formData.append('categoria', categoria);
      formData.append('precio', price);
      formData.append('stock', stock);
      formData.append('clubspace', data.info[0].info.name);
      if (imageUri) {
        const uriParts = imageUri.uri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        formData.append('image', {
          uri: imageUri.uri,
          name: `photo.${fileType}`,
          type: `image/${fileType}`,
        });
      }


      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/user2/add_producto', formData, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Producto añadido correctamente.');
        onClose(); // Cerrar el modal después de añadir el producto
      }
      return response.data;
    } catch (error) {
      console.error('Error while adding the product:', error);
      Alert.alert('Error', 'Failed to add product');
      return null;
    }
  };

  const handleAddProduct = () => {
    add_prod();
  };

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.title}>Añadir Producto</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del producto"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={descripcion}
            onChangeText={setDescripcion}
          />

          {/* Campo desplegable para seleccionar la categoría */}
          <Picker
            selectedValue={categoria}
            style={styles.input}
            onValueChange={(itemValue, itemIndex) => setCategoria(itemValue)}
          >
            <Picker.Item label="Flores" value="Flores" />
            <Picker.Item label="Hash" value="Hash" />
            <Picker.Item label="Iceolator" value="Iceolator" />
            <Picker.Item label="Extracciones" value="Extracciones" />
            <Picker.Item label="Comestibles" value="Comestibles" />
            <Picker.Item label="Bebidas" value="Bebidas" />
            <Picker.Item label="Comida" value="Comida" />
            <Picker.Item label="Parafernalia" value="Parafernalia" />
          </Picker>

          <TextInput
            style={styles.input}
            placeholder="Precio"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* Botón para seleccionar imagen */}
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.buttonText}>Seleccionar Imagen</Text>
          </TouchableOpacity>

          {/* Mostrar la imagen seleccionada */}
          {imageUri && (
            <Image
              source={{ uri: imageUri.uri }}
              style={styles.previewImage}
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Stock"
            value={stock}
            onChangeText={setStock}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.button} onPress={handleAddProduct}>
            <Text style={styles.buttonText}>Añadir Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  modalContent: {
    backgroundColor: '#212121',
    width: '100%',
    height:'100%',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#00FFFF',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    width: 200,
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
  previewImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default AddProd;
