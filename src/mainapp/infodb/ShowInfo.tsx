import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import ip from "../../ips.json";

const TestScreen = () => {
  const [loading, setLoading] = useState(true);
  const [dataInfodb, setDataInfodb] = useState([]);
  const route = useRoute();
  const { espacioName, btnName } = route.params;

  const infodb = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName, "btnName": btnName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/infodb`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("Error al obtener información de riegos");
        } else {
          console.log(response.data)
          console.log(btnName)
          let cual = ""
          if (btnName === "DatosRelleno"){
            cual = "info_relleno"
          }
          else if (btnName === "DatosRiego"){
            cual = "info_riego"
          }else{
            cual = "info"
          }
          console.log(cual)
          console.log(response.data[cual])
          const valores = response.data[cual].map((item, index) => ({
            ...item,
            id: item.id || index + 1,
          })).reverse();
          setDataInfodb(valores);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
    }
  };

  useEffect(() => {
    infodb();
  }, []);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const renderRiegoItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Riego ID: {item.id}</Text>
      <Text style={styles.cardText}>Fecha y Hora: {formatDate(item.timestamp)}</Text>
      <Text style={styles.cardText}>Espacio: {item.info_riego.space}</Text>
      <Text style={styles.cardText}>Litros por Hora: {item.info_riego.litroHora}</Text>
      <Text style={styles.cardText}>Temperatura del Agua: {item.info_riego.tempWater}°C</Text>
      <Text style={styles.cardText}>Líquido Total: {item.info_riego.likidoTotal}L</Text>
      <Text style={styles.cardText}>Cantidad de Riego: {item.info_riego.cantidadRiego}ml</Text>
      <Text style={styles.cardText}>Hora de Riego: {item.info_riego.horaRiegoStr}</Text>
      <Text style={styles.cardText}>Fertilizantes: {item.info_riego.fertis}</Text>
    </View>
  );

  const renderRellenaItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Rellenado ID: {item.id}</Text>
      <Text style={styles.cardText}>Fecha y Hora: {formatDate(item.timestamp)}</Text>
      <Text style={styles.cardText}>Cantidad: {item.info_relleno.cantidadRellenar}L</Text>
    </View>
  );

  const renderItem = (props) => {
    console.log('melon')
    console.log(props)
    console.log(btnName)
    if(btnName === "DatosRiego") {
      return renderRiegoItem(props);
    } else if(btnName === "DatosRelleno") {
      return renderRellenaItem(props);
    } else {
      return null;
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={dataInfodb}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListHeaderComponent={
            <>
              <Text style={styles.title}>Historial de {btnName}</Text>
              <Text style={styles.text}>Espacio: {espacioName}</Text>
            </>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    marginVertical: 5,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 8,
    width: '100%',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TestScreen;
