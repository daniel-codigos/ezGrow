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

  useEffect(() => {
    fetchTanksInfo();
    fetchSensors();
  }, []);

  const fetchTanksInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_bidones`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        },
      });

      if (response.status === 200 && !response.data.Error) {
        response.data.forEach((element) => {
          if (element.info.space === espacioName) {
            if (element.info.tipo === "riego") {
              setIrrigationTankInfo(element.info);
            } else {
              setFillingTankInfo(element.info);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error al obtener información de tanques:', error);
    }
  };

  const fetchSensors = async () => {
    try {
      setLoading(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        },
      });

      if (response.status === 200 || response.status === 201) {
        const initialSensors = response.data.map((sensor) => ({
          ...sensor,
          isLoading: true,
          data: null,
        }));
        setSensors(initialSensors);

        // Cargar datos individuales para cada sensor
        initialSensors.forEach((sensor, index) => fetchSensorData(sensor, index));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar sensores:', error);
      setLoading(false);
    }
  };

  const calculateLiters = (distance, emptyDistance, oneLiterDistance, multiplier = 1) => {
    const currentSpace = emptyDistance - distance;
    const literSpace = emptyDistance - oneLiterDistance;
    return (currentSpace / literSpace) * multiplier;
  };


  const fetchSensorData = async (sensor, index) => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName, reg: 8, info: sensor.info };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/now_info_sensor`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        },
      });
      
      await console.log(response.data)

      console.log("-------------------------------------------------------")
      setSensors((prevSensors) =>
        prevSensors.map((item, idx) =>
          idx === index
            ? { ...item, isLoading: false, data: response.data || null }
            : item
        )
      );
    } catch (error) {
      console.error('Error al cargar datos del sensor:', error);
      setSensors((prevSensors) =>
        prevSensors.map((item, idx) =>
          idx === index ? { ...item, isLoading: false, data: null } : item
        )
      );
    }
  };

  const renderSensorInfo = (sensor, index) => {
    if (sensor.isLoading) {
      return (
        <View key={index} style={styles.sensorContainer}>
          <ActivityIndicator size="small" color="#007AFF" />
          <Text style={styles.sensorLabel}>Cargando...</Text>
        </View>
      );
    }

    if (sensor.data) {
      const { name, respuesta, topic } = sensor.info;
      let liters = 0;
      let displayName = "";
      switch (topic) {
        case 'sen_temp_hume':
          console.log("sen_temp_hume")
          console.log(sensor)
          return (
            <View key={index} style={styles.sensorContainer}>
              <Text style={styles.sensorTitle}>🌡️ Temperatura y Humedad</Text>
              <Text style={styles.sensorLabel}>
                Temperatura: <Text style={styles.sensorValue}>{sensor.data.temperatura} °C</Text>
              </Text>
              <Text style={styles.sensorLabel}>
                Humedad: <Text style={styles.sensorValue}>{sensor.data.humedad} %</Text>
              </Text>
            </View>
          );
        case 'sen_water_dist':
          console.log("sen_water_dist")
          console.log(sensor.data)
          console.log(sensor.data.distancia)
          if (name.includes("relleno")) {
            if (sensor.data) {
              displayName = "🚰 Relleno";
              liters = calculateLiters(sensor.data.distancia, fillingTankInfo?.distVacio, fillingTankInfo?.dist1L, 2);
            } else {
              <Text style={styles.sensorLabel}>No hay datos disponibles</Text>;
            }
          } else {
            if (sensor.data) {
              displayName = "🚰 Riego";
              liters = calculateLiters(sensor.data.distancia, irrigationTankInfo?.distVacio, irrigationTankInfo?.dist1L);
            } else {
              <Text style={styles.sensorLabel}>No hay datos disponibles</Text>;
            }
          }
          return (
            <>
            <View key={index} style={styles.sensorContainer}>
              <Text style={styles.sensorTitle}>{displayName}</Text>
              <Text style={styles.sensorname}>{sensor.data.name} </Text>
              <Text style={styles.sensorLabel}>
                Cantidad: <Text style={styles.sensorValue}>{liters.toFixed(2)} L</Text>
              </Text>
            </View>
            </>
          );
          case 'sen_water_temp':
            return (
              <>
              <View key={index} style={styles.sensorContainer}>
                <Text style={[styles.sensorTitle, styles.iconLarge]}>🌡️ 💧</Text>
                <Text style={styles.sensorname}>{sensor.data.name} </Text>
                <Text style={styles.sensorLabel}>
                  Temperatura: <Text style={styles.sensorValue}>{sensor.data ? sensor.data.temperatura : "No se encontraron datos"} °C</Text>
                </Text>
              </View>
              </>
            );
          case 'sen_hume_tierra':
            return (
              <>
              <View key={index} style={styles.sensorContainer}>
                <Text style={[styles.sensorTitle, styles.iconLarge]}>%💧Suelo</Text>
                <Text style={styles.sensorname}>{sensor.data.name} </Text>
                <View style={{ flexDirection: "column" }}>
                  {sensor.data.sensores ? (
                    Object.entries(sensor.data.sensores).map(([id, value]) => (
                      <Text key={id} style={styles.sensorValue}>
                        sensor {id} {"->"} valor: {value}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.sensorValue}>No hay datos</Text>
                  )}
                </View>
              </View>
              </>
            );
        default:
          return (
            <View key={index} style={styles.sensorContainer}>
              <Text style={styles.sensorLabel}>Datos del sensor no reconocidos.</Text>
            </View>
          );
      }
    }

    return (
      <View key={index} style={styles.sensorContainer}>
        <Text style={styles.sensorLabel}>Error al cargar datos.</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Dashboard - {espacioName}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Menu', { espacioName })}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Menú</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <View style={styles.dashboardContainer}>
          {sensors.length > 0 ? (
            sensors.map((sensor, index) => renderSensorInfo(sensor, index))
          ) : (
            <Text style={styles.noDataText}>No hay sensores disponibles.</Text>
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
    backgroundColor: '#212121',
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
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  dashboardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  sensorContainer: {
    backgroundColor: '#dcdcdc',
    borderRadius: 12,
    padding: 15,
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  sensorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#007AFF',
  },
  sensorLabel: {
    fontSize: 14,
    color: '#333',
  },
  sensorname:{
    fontSize: 14,
    fontWeight:"bold",
    color: '#333',
    borderBottomWidth:1,
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
  loadingIndicator: {
    marginVertical: 20,
  },
});
