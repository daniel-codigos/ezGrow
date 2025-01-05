import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import CryptoJS from 'crypto-js';
import ip from "../ips.json";

const NuevaPantalla = () => {
  const navigation = useNavigation();

  const texto = 'AAAAA-BBBBB-XDDDoyeesestabro';
  const key = CryptoJS.enc.Utf8.parse('4RkcR94EwTTuh5Fwln6mNnbq'); // Asegúrate de que tenga 16 bytes para AES
  const iv = CryptoJS.enc.Utf8.parse('mR7hECqKXxACbySov54PxOA3'); // Asegúrate de que tenga 16 bytes para AES

  const encrypted = CryptoJS.AES.encrypt(texto, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
  });
  console.log(encrypted.toString())
  const volverAPantallaPrincipal = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text>Camara Streaming</Text>
      <WebView
        source={{
          uri: `http://${ip.ips.camara}/video`,
          headers: { Authorization: 'Bearer '+encrypted.toString() }
        }}
        style={styles.webview}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  webview: {
    flex: 1,
    width: 420,
    borderWidth: 1,
    borderColor: "black",
  },
});

export default NuevaPantalla;