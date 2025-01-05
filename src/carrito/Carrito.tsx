// src/Carrito.tsx
import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';  // Asegúrate de tener este paquete instalado

const Carrito = ({ visible, onClose, cartItems, removeFromCart }) => {
  console.log(cartItems);

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Carrito de Compras</Text>
          <FlatList
            data={cartItems}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={styles.cartItem}>
                <Text style={styles.itemText}>{item.nombre} - {item.cantidad} x {item.precio}€</Text>
                <TouchableOpacity onPress={() => removeFromCart(item)} style={styles.removeItemButton}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />
          <View style={{flexDirection:'row'}}>
            <TouchableOpacity onPress={onClose} style={styles.button}>
                <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.button}>
                <Text style={styles.buttonText}>Comprar</Text>
          </TouchableOpacity>
          </View>

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
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    marginTop: 20,
    marginLeft:20,
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  itemText: {
    fontSize: 16,
  },
  removeItemButton: {
    padding: 5,
  },
});

export default Carrito;
