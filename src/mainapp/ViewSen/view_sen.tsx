import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Text, FlatList } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import ip from "../../ips.json";
import InfoModal from './InfoModal';
import OpSensores from './OpSensores';

export default function TabOneScreen() {
  const [sensorData, setSensorData] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [showOPciones, setshowOPciones] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [indexItem, setindexItem] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [loadingSpaces, setLoadingSpaces] = useState(true);
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;



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
    setindexItem(sensorId)
    setshowOPciones(true)
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
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        },
      });
      console.log("asdasdasd")
      await console.log(response.data)
      if (response.status === 200 || response.status === 201) {
        console.log("asd-----------------------------------------------------------------")
        console.log(response.data)
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
      style={styles.tableRow}
    >
      <Text style={styles.tableCell}>{item.info.name}</Text>
      <Text style={styles.tableCell}>{item.info.esp_cat}</Text>
      <Text style={styles.tableCell}>{item.info.topic}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensores Disponibles</Text>
      {cargando ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>Nombre</Text>
            <Text style={styles.headerCell}>Espacio</Text>
            <Text style={styles.headerCell}>Topic</Text>
          </View>
          <FlatList
            data={sensors}
            renderItem={renderSensorItem}
            keyExtractor={(item, index) => index.toString()}
            contentContainerStyle={styles.tableBody}
          />
        </View>
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

      <OpSensores isVisible={showOPciones} onClose={() => setshowOPciones(false)} data={indexItem || {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F4F9FD',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#003366',
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  table: {
    //flex: 0,
    borderWidth: 3,
    borderColor: '#B0BEC5',
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    padding: 5,
  },
  headerCell: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  tableBody: {
    padding: 2,
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    alignItems: 'center',
  },
  tableCell: {
    flex: 1,
    fontSize: 16,
    color: 'black',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 20,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  deleteButton: {
    position: 'absolute',
    bottom: 90,
    alignSelf: 'center',
    backgroundColor: '#FF3D00',
    padding: 16,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    width: 60,
    height: 60,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
