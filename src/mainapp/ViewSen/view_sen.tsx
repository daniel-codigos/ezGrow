import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Text, FlatList, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import ip from "../../ips.json";
import OpSensores from './OpSensores';

export default function TabOneScreen() {
  const [sensors, setSensors] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [showOPciones, setshowOPciones] = useState(false);
  const [indexItem, setindexItem] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;

  const take_sensor = async () => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      setSensors(response.data);
      setCargando(false);
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setCargando(false);
    }
  };

  useEffect(() => {
    take_sensor();
  }, []);

  const cada_obj = (sensorId) => {
    setindexItem(sensorId);
    setshowOPciones(true);
  };

  const renderSensorCard = ({ item }) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => cada_obj(item.info)}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={require('../../assets/sensors.png')} // Imagen local
          style={styles.cardImage}
        />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.info.name}</Text>
        <Text style={styles.cardSubtitle}>Espacio: {item.info.esp_cat}</Text>
        <Text style={styles.cardTopic}>Topic: {item.info.topic}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensores Disponibles</Text>
      {cargando ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={sensors}
          renderItem={renderSensorCard}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.flatListContainer}
        />
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('pages/rgstr_ofi', { espacioName })} style={styles.addButton}>
          <Icon2 name="add" size={30} color="#ffffff" />
        </TouchableOpacity>
      </View>
      <OpSensores isVisible={showOPciones} onClose={() => setshowOPciones(false)} data={indexItem || {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#212121',
    justifyContent:"center",
    alignContent:"center",
    //alignItems:"center",
  },
  flatListContainer: {
    paddingHorizontal: 10,
    paddingBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
    marginVertical: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  cardContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 15,
    width:"65%",
    marginLeft:"18%",
    marginBottom: 10,
    elevation: 4, // Sombra en Android
    shadowColor: '#000', // Sombra en iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardImage: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#555555',
    marginVertical: 4,
  },
  cardTopic: {
    fontSize: 12,
    color: '#777777',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
