import { StyleSheet, TouchableOpacity, ActivityIndicator, Image, TextInput, Alert, Modal, Text, View, ScrollView, Animated, Easing, ImageBackground, FlatList } from 'react-native';
import React, { useState, useEffect, useRef } from "react";
import AddProd from './prodMenu/addProd';
import DelProd from './prodMenu/delProd';
import EditProd from './prodMenu/editProd';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "../ips.json";

const ManageMenu = ({ visible, onClose, clubInfoPrin }) => {
  const [menu, setMenu] = useState([]);
  const [isAddProdVisible, setIsAddProdVisible] = useState(false);
  const [isDelProdVisible, setIsDelProdVisible] = useState(false);
  const [isEditProdVisible, setIsEditProdVisible] = useState(false);

  const del_prod = async (selectDelete) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const fin = { 'nombre': selectDelete, 'club':clubInfoPrin.info[0].info.name};
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/user2/delete_producto', { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
  
      if (response.status === 200 || response.status === 201) {
        console.log("borrado correctamente!!!");
      } else {
        console.log("Error al eliminar el producto:", response.data.error);
      }
  
      return response.data;
    } catch (error) {
      // Aquí capturamos errores del servidor, incluidos los mensajes detallados
      if (error.response) {
        console.error('Error al eliminar el producto:', error.response.data.error);
      } else {
        console.error('Error de red o de otra índole:', error.message);
      }
      return null;
    }
  }
  
  const get_menu = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      console.log(clubInfoPrin.info)
      console.log('l.olasd')
      const fin = JSON.stringify(clubInfoPrin.info[0]);
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/user2/get_producto',{fin}, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.status === 200 || response.status === 201) {
        console.log("feo")
        console.log(response.data)
        setMenu(response.data)
      }
      return response.data;
    } catch (error) {
      console.error('Error while adding the product:', error);
      Alert.alert('Error', 'Failed to add product');
      return null;
    }
  };


  useEffect(() => {
    get_menu()
  }, []);

  console.log(clubInfoPrin)
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Gestionar Menú y Stock</Text>
          {menu.length > 0 ? (
            <FlatList
              data={menu}
              keyExtractor={item => item.id ? item.id.toString() : Math.random().toString()}
              renderItem={({ item }) => (
                <View style={{flexDirection:"row",alignContent:"center",alignItems:"center"}}>
                  <View style={styles.item}>
                    <Text style={styles.itemText}>{item.info.nombre} - {item.info.precio ? item.info.precio +"€" : 'No disponible'}</Text>
                    <Text style={styles.itemText}>categoria: {item.info.categoria}</Text>
                    <Text style={styles.itemText}>Stock: {item.info.stock}</Text>
                  </View>
                  <View style={{marginLeft:20,flexDirection:'row'}}>
                    <TouchableOpacity onPress={() => {
                      console.log("editar")
                      console.log(item.info.nombre)
                      console.log(JSON.stringify(clubInfoPrin.info[0]))
                      }}>
                        <Text>🖋️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {
                      console.log("borrar")
                      console.log(item.info.nombre)
                      console.log(clubInfoPrin.info[0].info.name)
                      del_prod(item.info.nombre)
                      }}>
                        <Text style={{marginLeft:10}}>🗑️</Text>
                    </TouchableOpacity>
                    
                  </View>

                </View>
              )}
            />
          ) : (
            <View>
              <Text style={styles.itemText}>Debemos de añadir productos al menú!!</Text>
            </View>
          )}

          <TouchableOpacity style={styles.button} onPress={() => {
              setIsAddProdVisible(true)
          }}>
            <Text style={styles.buttonText}>Añadir Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {
            setIsEditProdVisible(true)
          }}>
            <Text style={styles.buttonText}>Editar Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {
            setIsDelProdVisible(true)
          }}>
            <Text style={styles.buttonText}>Eliminar Producto</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
      <AddProd 
            visible={isAddProdVisible} 
            onClose={() => setIsAddProdVisible(false)}
            data={clubInfoPrin}
          />
      <DelProd 
        visible={isDelProdVisible} 
        onClose={() => setIsDelProdVisible(false)}
      />
      <EditProd 
        visible={isEditProdVisible} 
        onClose={() => setIsEditProdVisible(false)}
        clubInfoPrin={clubInfoPrin}
      />
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
  item: {
    marginBottom: 10,
  },
  itemText: {
    color: '#FFFFFF',
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

export default ManageMenu;
