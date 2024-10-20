import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Text, FlatList, TouchableWithoutFeedback } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import ip from "../ips.json";
import InfoModal from './InfoModal';

export default function TabOneScreen() {
  const [sensorData, setSensorData] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [infoCargada, setInfoCargada] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;

  const info_sensores = async (info) => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName, 'reg': 8, 'info': info };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/now_info_sensor`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setCargando(false);
        } else {
          if (response.data.space === espacioName) {
            setSensorData(response.data);
            setInfoCargada(true);
            setCargando(false);
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setCargando(false);
    }
  };

  const delete_sensor = async () => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName, 'info': selectedSensor };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/delete_sen`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        const data_info_del = response.data.info;
        const filteredSensors = sensors.filter(sensor => sensor.info.token !== data_info_del.token);
        setSensors(filteredSensors);
        setSelectedSensor(null);
        setShowDeleteButton(false);
      }
      setCargando(false);
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setCargando(false);
    }
  };

  const cada_obj = (sensorId) => {
    info_sensores(sensorId);
  };

  const handleLongPress = (sensorId) => {
    setSelectedSensor(sensorId);
    setShowDeleteButton(true);
  };

  const handleOutsidePress = () => {
    if (selectedSensor) {
      setSelectedSensor(null);
      setShowDeleteButton(false);
    }
  };

  const add_new_sen = (qhace) => {
    if (qhace === "add") {
      navigation.navigate('pages/rgstr_ofi', { espacioName: espacioName });
    } else {
      delete_sensor();
    }
  };

  const take_sensor = async () => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName }
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        setSensors(response.data);
        setLoadingSpaces(false);
      }
      setCargando(false);
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setCargando(false);
    }
  };

  useEffect(() => {
    take_sensor();
  }, []);

  const renderSensorItem = ({ item, index }) => (
    <TouchableOpacity
      key={index}
      onPress={() => cada_obj(item.info)}
      onLongPress={() => handleLongPress(item.info)}
      style={[styles.card, selectedSensor?.token === item.info.token ? styles.cardSelected : {}]}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.info.name}</Text>
        <Text style={styles.cardText}>Espacio: {item.info.esp_cat}</Text>
        <Text style={styles.cardText}>Topic: {item.info.topic}</Text>
        <Text style={styles.cardText}>Token: {item.info.token}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={handleOutsidePress}>
      <View style={styles.container}>
        <Text style={styles.title}>Sensores Disponibles</Text>
        {cargando ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={sensors}
            renderItem={renderSensorItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.sensorList}
            numColumns={2}
          />
        )}
        {showDeleteButton && (
          <TouchableOpacity onPress={() => add_new_sen('del')} style={styles.deleteButton}>
            <Icon2 name="delete" size={30} color="#ffffff" />
          </TouchableOpacity>
        )}
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => add_new_sen('add')} style={styles.actionButton}>
            <Icon2 name="add" size={30} color="#ffffff" />
          </TouchableOpacity>
        </View>
        <InfoModal isVisible={infoCargada} onClose={() => setInfoCargada(false)} data={sensorData} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  sensorList: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    width:'90%',
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    flex: 1,
    alignItems: 'center',
  },
  cardSelected: {
    borderColor: '#FF0000',
    borderWidth: 2,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 100,
    left: '50%',
    marginLeft: -30,
    backgroundColor: '#FF0000',
    padding: 16,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
