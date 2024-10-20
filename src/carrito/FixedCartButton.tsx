// src/FixedCartButton.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

const FixedCartButton = ({ openCarrito }) => (
  <TouchableOpacity style={styles.button} onPress={openCarrito}>
    <Image source={require('../assets/images/cart-icon.png')} style={styles.icon} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20, // Ajusta la posición vertical
    right: 20,  // Ajusta la posición horizontal
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ffdb3b',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  icon: {
    width: 30,
    height: 30,
  },
});

export default FixedCartButton;
