import { StyleSheet, TouchableOpacity, TextInput, Text, View , Image } from 'react-native';
import React, { useState, useEffect } from "react";
import Modal from 'react-native-modal';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "./ips.json"

export default function TabOneScreen() {
  const [isModalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [spaces, setSpaces] = useState({});
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const navigation = useNavigation();
  const showModal = () => {
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    
  };

  const take_spaces = async () =>{
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const response = await axios.get('http://'+ip['ips']['elegido']+'/api/user2/get_spaces', {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200 || response.status === 201) {
        console.log("ha lllegaaaooo jajajajajaj")
        console.log(response.data)
        setSpaces(response.data)
        setLoadingSpaces(false)
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el tokenxd:', error);
      return null;
    }
  }

  useEffect(() => {
    //takeUser_meross();
    take_spaces();
  }, []);

  const new_espacio = async (info) => {
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/user2/add_space', {
        nombre: info,
      }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          'Content-Type': 'application/json',
        },
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status in [200,201]) {
        console.log("ha lllegaaaooo jajajajajaj")
        setRefresh((prev) => prev + 1);
        //añadir un reload para que aparezca lo nuevo añadido.
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  }

  const handleButtonPress = (btntxt) => {
    console.log(btntxt);
    
    if (btntxt === 'add_new') {
      showModal();
    } else {
      navigation.navigate('DashBoard', { espacioName: btntxt });
      console.log('¡El botón ha sido presionado!');
      // Otras acciones según sea necesario
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.cont_prin}>
        <View style={styles.text_ini}>
        <Image 
          source={require('./assets/images/ezgrow_logo.jpg')} // Reemplaza con la ruta de tu imagen
          style={styles.image}
        />
          {/*<Text style={styles.textos_def}>Bienvenido!! Espacios disponibles:</Text>*/}
        </View>
        <View style={styles.cont_espacios}>
          {loadingSpaces === true ? (
            <Text>Cargando espacios...</Text>
            ) : spaces.length > 0 ? (
            spaces.map((space, index) => (
              <View key={index}>
                
                <TouchableOpacity
                  key={index}
                  onPress={() => handleButtonPress(space.nombre)}
                  style={styles.button_spcs}>
                    <Text style={{fontSize:30}}>🚪</Text>
                  <Text>{space.nombre}</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
              <Text>No hay elementos que mostrar</Text>
          )}
        </View>
        <View style={styles.cont_btns}>
          <TouchableOpacity onPress={(e) => handleButtonPress("add_new")} style={styles.button}>
            <Text style={{fontSize:30}}>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={(e) => handleButtonPress("delete")} style={styles.button}>
            <Text style={{fontSize:30}}>🗑️</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal isVisible={isModalVisible} backdropOpacity={0.5}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Ingrese un nombre:</Text>
          <TextInput
            style={styles.modalInput}
            value={inputValue}
            onChangeText={(text) => setInputValue(text)}
          />
          <View style={styles.modalButtonsContainer}>
            <TouchableOpacity
              onPress={() => {
                // Guardar la lógica aquí
                console.log(inputValue)
                new_espacio(inputValue)
                hideModal();
                setInputValue("")
              }}
              style={styles.modalButton}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                // Lógica de cancelar aquí
                hideModal();
              }}
              style={styles.modalButton}
            >
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width:"100%",
    height:"100%",
    backgroundColor:"#212121",
  },
  cont_prin:{
    //marginHorizontal: 20,
    flexDirection: "column",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "center",
    alignContent: "center",
    height:"100%",
    //borderWidth: 2, // Ancho del borde en píxeles
    //borderColor: 'black', // Color del borde (puedes usar cualquier color válido)
  },
  text_ini:{
    flexWrap: "wrap",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    alignContent: "flex-start",
  },
  cont_espacios:{
    //borderWidth: 2,
    //borderColor: 'black',
    flexDirection: "row",
    marginTop:25,
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  cont_btns:{
    //borderWidth: 2,
    //borderColor: 'black',
    position:"absolute",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    alignContent: "center",
    bottom:10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    top:0,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  image: {
    width: 350, // Ancho de la imagen
    height: 100, // Alto de la imagen
    marginBottom: 15, // Espacio entre la imagen y el texto
    borderRadius: 50, // Para redondear los bordes de la imagen
  },
  button: {
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    padding: 15,
    marginLeft:20,
    marginRight:20,
    borderRadius: 15, // Bordes redondeados del botón (ajusta según lo desees)
    //marginTop: 100, // Espacio superior para separar el botón del título
    textAlign:"center",
    width: 75,
    height:75,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  button_spcs:{
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    padding: 15,
    marginLeft:20,
    marginRight:20,
    borderRadius: 15, // Bordes redondeados del botón (ajusta según lo desees)
    //marginTop: 100, // Espacio superior para separar el botón del título
    textAlign:"center",
    width: 120,
    height:120,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  buttonText: {
    color: '#FFFFFF', // Color del texto del botón (puedes cambiarlo)
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:"center",
  },
  textos_def:{
    marginTop:10,
    color: '#fff', // Color del texto del botón (puedes cambiarlo)
    fontSize: 18,
    fontWeight: 'bold',
    textAlign:"center",
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
  },
});