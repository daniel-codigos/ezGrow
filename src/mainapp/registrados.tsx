import React, { useState, useEffect } from "react";
import { StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { View, Text, Button } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import ip from "../ips.json"

const NuevaPantalla = () => {
  const route = useRoute();
  const { espacioName } = route.params;
  const [inputValue, setInputValue] = useState('');
  const navigation = useNavigation();
  const [tipoSenVal, setTipoSenVal] = useState('sen_temp_hume');
  const [nameSen, setNameSen] = useState('');
  const [cualSpace, setCualSpace] = useState('opcion1');
  const [cualSpaceNum, setCualSpaceNum] = useState(1);
  const [sensores, setSensores] = useState({});
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const take_spaces = async () =>{
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, {fin},{
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
        setSensores(response.data)
        setLoadingSpaces(false)
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  }

  useEffect(() => {
    //takeUser_meross();
    take_spaces();
  }, []);

  

  return (
    <View>
        <View>

            <Text style={styles.modalText}>Ubicacion del sensor:</Text>

                {loadingSpaces ? (
                <Text>Cargando espacios...</Text>
                ) : sensores.length > 0 ? (
                <Picker
                    selectedValue={cualSpace}
                    onValueChange={(itemValue, itemLabel) => {
                      setCualSpace(itemValue);
                      setCualSpaceNum(itemValue);
                    }}>
                    {sensores.map((space, index) => (
                    <Picker.Item
                        key={index}
                        label={space.nombre}  // Ajusta según la estructura real de tus datos
                        value={space.cat_space}  // Ajusta según la estructura real de tus datos
                        style={styles.txt_opsel}
                    />
                    ))}
                </Picker>
                ) : (
                <Text>No hay espacios disponibles.</Text>
                )}
        </View>
      
      <Button title="Registrar!!" />
    </View>
  );
  
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      width:"100%",
      height:"100%",
    },
    cont_prin:{
      //marginHorizontal: 20,
      flexDirection: "column",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      alignItems: "center",
      alignContent: "flex-start",
      height:"100%",
      //borderWidth: 2, // Ancho del borde en píxeles
      //borderColor: 'black', // Color del borde (puedes usar cualquier color válido)
    },
    txt_opsel:{
        color: '#000000', // Color del texto del botón (puedes cambiarlo)
        fontSize: 16,
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

export default NuevaPantalla;