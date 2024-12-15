import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import Modal from 'react-native-modal';
import { useNavigation, useRoute } from '@react-navigation/native';
import InfoModal from './InfoModal';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Icon2 from 'react-native-vector-icons/MaterialIcons';
import ip from "../../ips.json";

interface OpSenProps {
  isVisible: boolean;
  onClose: () => void;
  data: any; // Ajusta el tipo según tus datos
}

const OpSensores: React.FC<OpSenProps> = ({ isVisible, onClose, data }) => {
  const [infoCargada, setInfoCargada] = useState(false);
  const [sensorData, setSensorData] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [sensors, setSensors] = useState([]);
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
        Alert.alert("Borrado correctamente!")
        onClose()
      }
      setCargando(false);
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setCargando(false);
    }
  };

  const cada_obj = (sensorId) => {
    console.log("atentooo")
    console.log(sensorId)
    info_sensores(sensorId)
  };

  const empieza = () => {
    console.log(data);
    console.log('Información del sensor cargada');
  };

  useEffect(() => {
    console.log("locooooasdasdasd")
    setSelectedSensor(data)
    console.log(isVisible)
    if (isVisible) {
      empieza();
    }
  }, [isVisible]);

  return (
    <>
      <Modal isVisible={isVisible} onBackdropPress={onClose}>
        <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>{data.name}</Text>
        {cargando ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
          {/* Botón: Rutina */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              console.log('Rutina');
            }}
          >
            <Text style={styles.optionButtonText}>Rutina</Text>
          </TouchableOpacity>

          {/* Botón: Usar */}
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => cada_obj(data)}
          >
            <Text style={styles.optionButtonText}>Usar</Text>
          </TouchableOpacity>

          {/* Botón: Borrar */}
          <TouchableOpacity style={styles.optionButton} onPress={() => delete_sensor()}>
            <Text style={styles.optionButtonText}>Borrar</Text>
          </TouchableOpacity>

          {/* Botón: Cambiar de Sala */}
          <TouchableOpacity style={styles.optionButton} onPress={() => console.log('Cambiar de Sala')}>
            <Text style={styles.optionButtonText}>Cambiar de Sala</Text>
          </TouchableOpacity>

          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
          </>
          )}
        </View>
      </Modal>

      {/* InfoModal */}
      {infoCargada && (
        <InfoModal
          isVisible={infoCargada}
          onClose={() => setInfoCargada(false)}
          data={sensorData}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  optionButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginVertical: 5,
    width: '80%',
    alignItems: 'center',
  },
  optionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    width: '80%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loadingIndicator: {
    marginVertical: 20,
  },
});

export default OpSensores;
