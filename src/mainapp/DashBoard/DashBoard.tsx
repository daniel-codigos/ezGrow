import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useNavigation, useRoute } from '@react-navigation/native';
import Graficas from './Graficas'; // Importa el componente de las gráficas
import ip from "../../ips.json";




export default function SensorDashboard() {
  const route = useRoute();
  const navigation = useNavigation();
  const { espacioName } = route.params;

  const [loading, setLoading] = useState(false);
  const [sensors, setSensors] = useState([]);
  const [irrigationTankInfo, setIrrigationTankInfo] = useState([]);
  const [fillingTankInfo, setFillingTankInfo] = useState([]);
  const [tanksUpdated, setTanksUpdated] = useState(false);

  useEffect(() => {
    fetchSensorsInfo();
    fetchTanksInfo();
  }, []);


  const handleButtonPress = (buttonText: string) => {
    navigation.navigate('Menu', { espacioName });
  };

  const fetchTanksInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_bidones`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        }
      });

      if (response.status === 200 && !response.data['Error']) {
        response.data.forEach(element => {
          if (element.info.space === espacioName) {
            if (element.info.tipo === "riego") {
              setIrrigationTankInfo(element.info);
            } else {
              setFillingTankInfo(element.info);
            }
            setTanksUpdated(true);
          }
        });
      } else {
        console.error("Error al obtener información de bidones");
      }
    } catch (error) {
      console.error('Error al obtener información de bidones:', error);
    }
  };

  const fetchSensorsInfo = async () => {
    try {
      setLoading(true);
  
      // Verificar si los datos están almacenados en SecureStore
      const storedData = await SecureStore.getItemAsync('dashInfo'+espacioName);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const { sensors, timestamp } = parsedData;
  
        // Calcular si han pasado más de 5 minutos desde el timestamp
        const now = new Date().getTime();
        if (now - timestamp < 60 * 60 * 1000) {
          console.log('Usando datos almacenados en SecureStore.');
          setSensors(sensors);
          setLoading(false);
          return; // Salir de la función si los datos son válidos
        }
      }
  
      // Si no hay datos válidos, realizar la solicitud
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/dashsen_all`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        },
      });
  
      if (response.status === 200 && !response.data['Error']) {
        console.log("+------------------------------------------+");
        console.log(response.data);
  
        // Guardar los datos y el timestamp en SecureStore
        const newData = {
          sensors: response.data,
          timestamp: new Date().getTime(),
        };
        await SecureStore.setItemAsync('dashInfo'+espacioName, JSON.stringify(newData));
        setSensors(response.data);
      }
  
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener información de sensores:', error);
      setLoading(false);
    }
  };
  


  const calculateLiters = (distance, emptyDistance, oneLiterDistance, multiplier = 1) => {
    const currentSpace = emptyDistance - distance;
    const literSpace = emptyDistance - oneLiterDistance;
    return (currentSpace / literSpace) * multiplier;
  };

  const renderSensorInfo = (sensor: any) => {
    const { name, respuesta, topic } = sensor.info;
    let valueDisplay = null;
    let liters = 0;
    let displayName = "";
  
    switch (topic) {
      case 'sen_temp_hume':
        valueDisplay = (
          <>
            <Text style={[styles.sensorTitle, styles.iconLarge]}>🌡️ ♨️</Text>
            <Text style={styles.sensorLabel}>
              Temperatura: <Text style={styles.sensorValue}>{respuesta ? respuesta.temperatura : "No datos."} °C</Text>
            </Text>
            <Text style={styles.sensorLabel}>
              Humedad: <Text style={styles.sensorValue}>{respuesta ? respuesta.humedad : "No datos"} %</Text>
            </Text>
          </>
        );
        break;
      case 'sen_water_dist':
        if (name.includes("relleno")) {
          if (respuesta) {
            displayName = "🚰 Relleno";
            liters = calculateLiters(respuesta.distancia, fillingTankInfo?.distVacio, fillingTankInfo?.dist1L, 2);
          } else {
            <Text style={styles.sensorLabel}>No hay datos disponibles</Text>;
          }
        } else {
          if (respuesta) {
            displayName = "🚰 Riego";
            liters = calculateLiters(respuesta.distancia, irrigationTankInfo?.distVacio, irrigationTankInfo?.dist1L);
          } else {
            <Text style={styles.sensorLabel}>No hay datos disponibles</Text>;
          }
        }
  
        valueDisplay = (
          <>
            <Text style={styles.sensorTitle}>{displayName}</Text>
            <Text style={styles.sensorLabel}>
              Cantidad: <Text style={styles.sensorValue}>{liters.toFixed(2)} L</Text>
            </Text>
          </>
        );
        break;
      case 'sen_water_temp':
        valueDisplay = (
          <>
            <Text style={[styles.sensorTitle, styles.iconLarge]}>🌡️ 💧</Text>
            <Text style={styles.sensorLabel}>
              Temperatura: <Text style={styles.sensorValue}>{respuesta ? respuesta.temperatura : "No se encontraron datos"} °C</Text>
            </Text>
          </>
        );
        break;
      case 'sen_hume_tierra':
        valueDisplay = (
          <>
            <Text style={[styles.sensorTitle, styles.iconLarge]}>🌡️ 💧</Text>
            <Text style={styles.sensorLabel}>Humedad Suelo: </Text>
            <View style={{ flexDirection: "column" }}>
              {respuesta ? (
                Object.entries(respuesta?.sensores).map(([id, value]) => (
                  <Text key={id} style={styles.sensorValue}>
                    sensor {id} {"->"} valor: {value}
                  </Text>
                ))
              ) : (
                <Text style={styles.sensorValue}>No hay datos</Text>
              )}
            </View>
          </>
        );
        break;
      default:
        valueDisplay = <Text style={styles.sensorLabel}>Información desconocida</Text>;
    }
  
    return (
      <View key={name} style={styles.sensorContainer}>
        {valueDisplay}
      </View>
    );
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Dashboard - {espacioName}</Text>
        <TouchableOpacity onPress={() => handleButtonPress("MenuScreen")} style={styles.button}>
          <Text style={styles.buttonText}>Menu</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <View>
          {sensors.length > 0 ? (
            <View style={styles.dashboardContainer}>
              {/* Ordenar sensores: primero los `sen_hume_tierra` */}
              {[...sensors]
                .sort((a, b) => (a.info.topic === 'sen_hume_tierra' ? -1 : b.info.topic === 'sen_hume_tierra' ? 1 : 0))
                .map((sensor) => renderSensorInfo(sensor))}
            </View>
          ) : (
            <Text style={styles.noDataText}>No hay datos disponibles</Text>
          )}
        </View>
      )}
      <Graficas espacioName={espacioName} />
    </ScrollView>
  );
  


}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f2f7fc', // Fondo más suave
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#34c759', // Botón verde
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  dashboardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between', // Espaciado uniforme
    gap: 15,
  },
  sensorContainer: {
    backgroundColor: '#9db2c8', // Fondo azul claro para cada cajón
    padding: 15,
    borderRadius: 10,
    width: '45%', // Dos cajones por fila
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  sensorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '007AFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sensorLabel: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  sensorValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6c757d',
    marginTop: 20,
  },
  iconLarge: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 8,
  },
});
