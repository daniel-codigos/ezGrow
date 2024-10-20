import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Modal, FlatList, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "../../ips.json";

const EditProd = ({ visible, onClose, clubInfoPrin }) => {
  const [productId, setProductId] = useState('');
  const [menu, setMenu] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [editingProduct, setEditingProduct] = useState(null); // Para saber si estamos editando un producto

  // Obtener el menú del club
  const get_menu = async () => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const fin = JSON.stringify(clubInfoPrin.info[0]);
      const response = await axios.post('http://' + ip['ips']['elegido'] + '/api/user2/get_producto', { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.status === 200 || response.status === 201) {
        setMenu(response.data); // Setear el menú en el estado
      }
    } catch (error) {
      console.error('Error al obtener el menú:', error);
      Alert.alert('Error', 'Fallo al obtener el menú');
    }
  };

  // Función para editar un producto
  const handleEditProduct = async (product) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await axios.put('http://' + ip['ips']['elegido'] + `/api/user2/edit_producto/${product.id}`, {
        name,
        price,
        stock
      }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          'Content-Type': 'multipart/form-data'
        },
      });

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Éxito', 'Producto editado correctamente');
        get_menu(); // Refrescar el menú después de editar
        onClose();
      }
    } catch (error) {
      console.error('Error al editar el producto:', error);
      Alert.alert('Error', 'Fallo al editar el producto');
    }
  };

  // Función para eliminar un producto
  const handleDeleteProduct = async (productId) => {
    try {
      const token = await SecureStore.getItemAsync("token");
      const response = await axios.delete('http://' + ip['ips']['elegido'] + `/api/user2/delete_producto/${productId}`, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Éxito', 'Producto eliminado correctamente');
        get_menu(); // Refrescar el menú después de eliminar
      }
    } catch (error) {
      console.error('Error al eliminar el producto:', error);
      Alert.alert('Error', 'Fallo al eliminar el producto');
    }
  };

  useEffect(() => {
    if (visible) {
      get_menu(); // Obtener el menú cuando el modal esté visible
    }
  }, [visible]);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Lista de Productos</Text>

          {/* Listado de productos */}
          <FlatList
            data={menu}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.productItem}>
                <View style={styles.productDetails}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.productPrice}>Precio: ${item.price}</Text>
                  <Text style={styles.productStock}>Stock: {item.stock}</Text>
                </View>

                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => {
                      setEditingProduct(item);
                      setName(item.name);
                      setPrice(item.price.toString());
                      setStock(item.stock.toString());
                    }}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteProduct(item.id)}
                  >
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />

          {/* Si estamos editando un producto */}
          {editingProduct && (
            <View style={styles.editContainer}>
              <Text style={styles.title}>Editar Producto</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del producto"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Precio"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Stock"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.button} onPress={() => handleEditProduct(editingProduct)}>
                <Text style={styles.buttonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          )}

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
    width: '90%',
    borderRadius: 10,
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
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
    width: '100%',
  },
  productDetails: {
    flex: 2,
  },
  productName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productPrice: {
    color: '#00FFFF',
  },
  productStock: {
    color: '#FFFFFF',
  },
  productActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#FFD700',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  deleteButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 10,
  },
  editContainer: {
    width: '100%',
    marginTop: 20,
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
  }
});

export default EditProd;
