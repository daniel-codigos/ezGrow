import React from 'react';
import { View, Text, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NuevaPantalla = () => {

  const navigation = useNavigation();
  const volverAPantallaPrincipal = () => {
    navigation.goBack();
  };

  return (
    <View>
      <Text>Nueva Pantalla</Text>
      <Button title="Volver a Pantalla Principal" onPress={volverAPantallaPrincipal} />
    </View>
  );
};

export default NuevaPantalla;