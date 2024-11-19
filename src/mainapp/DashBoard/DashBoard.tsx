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
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/dashsen_all`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        }
      });

      if (response.status === 200 && !response.data['Error']) {
        console.log("+------------------------------------------+")
        console.log(response.data)
        setSensors(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener información de sensores:', error);
      setLoading(false);
    }
  };

  const handleButtonPress = (buttonText: string) => {
    navigation.navigate('Menu', { espacioName });
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
            <Text style={styles.sensorLabel}>Temperatura: <Text style={styles.sensorValue}>{respuesta ? respuesta.temperatura : "No datos."} °C</Text></Text>
            <Text style={styles.sensorLabel}>Humedad: <Text style={styles.sensorValue}>{respuesta ? respuesta.humedad : "No datos"} %</Text></Text>
          </>
        );
        break;
      case 'sen_water_dist':
        if (name.includes("relleno")) {
          if (respuesta) {
            displayName = "🚰 Relleno";
            liters = calculateLiters(respuesta.distancia, fillingTankInfo?.distVacio, fillingTankInfo?.dist1L, 2);
          }else{
            <>
              <Text style={styles.sensorLabel}>No hay datos disponibles</Text>
            </>
          }

        } else {
          if (respuesta) {
            displayName = "🚰 Riego";
            liters = calculateLiters(respuesta.distancia, irrigationTankInfo?.distVacio, irrigationTankInfo?.dist1L);
          }else{
            <>
              <Text style={styles.sensorLabel}>No hay datos disponibles</Text>
            </>
          }

        }

        valueDisplay = (
          <>
            <Text style={styles.sensorTitle}>{displayName}</Text>
            <Text style={styles.sensorLabel}>Cantidad: <Text style={styles.sensorValue}>{liters.toFixed(2)} L</Text></Text>
          </>
        );
        break;
      case 'sen_water_temp':
        valueDisplay = (
          <>
            <Text style={[styles.sensorTitle, styles.iconLarge]}>🌡️ 💧</Text>
            <Text style={styles.sensorLabel}>Temperatura: <Text style={styles.sensorValue}>{respuesta ? respuesta.temperatura : "No se encontraron datos"} °C</Text></Text>
          </>
        );
        break;
        case 'sen_hume_tierra':
          valueDisplay = (
            <>
              <Text style={[styles.sensorTitle, styles.iconLarge]}>🌡️ 💧</Text>
              <Text style={styles.sensorLabel}>Humedad Suelo: </Text>
              <View style={{flexDirection:"column"}}>
                {
                //<Text style={styles.sensorValue}>{respuesta ? JSON.stringify(respuesta.sensores) : "No se encontraron datos"} °C</Text>
                respuesta ? 
                Object.entries(respuesta?.sensores).map(([id, value]) => (
                  
                    <Text key={id} style={styles.sensorValue}>sensor {id} {"->"} valor: {value}</Text>
                  
                ))
                :
                  <Text style={styles.sensorValue}>No hay datos</Text>
                }
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
            <View>
                <View style={styles.dashboardContainer}> 
                    {sensors.map((sensor) => renderSensorInfo(sensor))}
                </View>
                
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
  // Aquí los estilos de SensorDashboard
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  dashboardContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  sensorContainer: {
    backgroundColor: '#CFCFCD',
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
  },
  iconLarge: {
    fontSize: 25,
  },
  sensorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  sensorLabel: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  sensorValue: {
    fontWeight: 'bold',
    color: '#000',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginLeft: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
