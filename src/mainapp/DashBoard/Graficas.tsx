import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ip from "../../ips.json";
import moment from 'moment';

const Graficas = () => {
  const [loadingCharts, setLoadingCharts] = useState(true);
  const [databaseInfo, setDatabaseInfo] = useState<any>([]);
  const [weeksRelleno, setWeeksRelleno] = useState<any>([]);
  const [weeksRiego, setWeeksRiego] = useState<any>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentWeekRelleno, setCurrentWeekRelleno] = useState<number>(0);
  const [currentWeekRiego, setCurrentWeekRiego] = useState<number>(0);
  const [totalWeeksRelleno, setTotalWeeksRelleno] = useState<number>(1);
  const [totalWeeksRiego, setTotalWeeksRiego] = useState<number>(1);
  const [selectedMonth, setSelectedMonth] = useState<string>(''); // Para el título del gráfico
  const route = useRoute();
  const navigation = useNavigation();
  const { espacioName } = route.params;

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const fetchDatabaseInfo = async () => {
    try {
      setLoadingCharts(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { space: espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/all_info_db`, { fin }, {
        headers: {
          Authorization: `Bearer ${JSON.parse(token).access}`,
        }
      });

      if (response.status === 200 && !response.data['Error']) {
        const mesesDisponibles = [...new Set(response.data.info_relleno.map((item: any) => item.timestamp.slice(0, 7)))];
        setAvailableMonths(mesesDisponibles);
        setDatabaseInfo(response.data);
        filtrarUltimaSemana(response.data); // Mostrar la última semana registrada por defecto
      } else {
        console.error("Error al obtener información de la base de datos");
      }
      setLoadingCharts(false);
    } catch (error) {
      console.error('Error al obtener información de la base de datos:', error);
      setLoadingCharts(false);
    }
  };

  const agregarDiasFaltantes = (data: any, mes: string) => {
    const daysInMonth = moment(mes, "YYYY-MM").daysInMonth();
    const fullDaysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    
    const labels = fullDaysArray.map(day => day < 10 ? `0${day}` : `${day}`);
    const completeData = labels.map((label) => {
      const found = data.find((item: any) => item.timestamp.slice(8, 10) === label);
      return found ? found.value : 0;
    });

    return { labels, data: completeData };
  };

  const dividirEnSemanas = (labels: string[], data: any[]) => {
    const semanas = [];
    const diasPorSemana = 7;

    for (let i = 0; i < labels.length; i += diasPorSemana) {
      const semanaLabels = labels.slice(i, i + diasPorSemana);
      const semanaData = data.slice(i, i + diasPorSemana);
      semanas.push({ labels: semanaLabels, data: semanaData });
    }

    return semanas;
  };

  const filtrarUltimaSemana = (data: any) => {
    const labelsRelleno = data.info_relleno.map((item: any) => item.timestamp.slice(8, 10)); // Solo el día
    const dataRelleno = data.info_relleno.map((item: any) => item.info_relleno.cantidadRellenar);
    const labelsRiego = data.info_riego.map((item: any) => item.timestamp.slice(8, 10)); // Solo el día
    const dataRiego = data.info_riego.map((item: any) => item.info_riego.cantidadRiego / 1000);

    const ultimaSemanaRelleno = labelsRelleno.slice(-7);
    const ultimaSemanaDataRelleno = dataRelleno.slice(-7);

    const ultimaSemanaRiego = labelsRiego.slice(-7);
    const ultimaSemanaDataRiego = dataRiego.slice(-7);

    setSelectedMonth('Ultima Semana'); 
    setWeeksRelleno([{ labels: ultimaSemanaRelleno, data: ultimaSemanaDataRelleno }]);
    setWeeksRiego([{ labels: ultimaSemanaRiego, data: ultimaSemanaDataRiego }]);

    setCurrentWeekRelleno(0);
    setCurrentWeekRiego(0);
    setTotalWeeksRelleno(1);
    setTotalWeeksRiego(1);
  };

  const filtrarPorMes = (mes: string) => {
    setSelectedMonth(mes); // Establecer el mes seleccionado
    const rellenoFiltrado = databaseInfo.info_relleno
      .filter((item: any) => item.timestamp.startsWith(mes))
      .map((item: any) => ({ timestamp: item.timestamp, value: item.info_relleno.cantidadRellenar }));
    
    const riegoFiltrado = databaseInfo.info_riego
      .filter((item: any) => item.timestamp.startsWith(mes))
      .map((item: any) => ({ timestamp: item.timestamp, value: item.info_riego.cantidadRiego / 1000 }));

    const { labels: labelsRellenoFinal, data: dataRellenoFinal } = agregarDiasFaltantes(rellenoFiltrado, mes);
    const { labels: labelsRiegoFinal, data: dataRiegoFinal } = agregarDiasFaltantes(riegoFiltrado, mes);

    const semanasRelleno = dividirEnSemanas(labelsRellenoFinal, dataRellenoFinal);
    const semanasRiego = dividirEnSemanas(labelsRiegoFinal, dataRiegoFinal);

    setWeeksRelleno(semanasRelleno);
    setWeeksRiego(semanasRiego);

    setCurrentWeekRelleno(0);
    setCurrentWeekRiego(0);

    setTotalWeeksRelleno(semanasRelleno.length);
    setTotalWeeksRiego(semanasRiego.length);
  };

  const cambiarSemanaRelleno = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior' && currentWeekRelleno > 0) {
      setCurrentWeekRelleno(currentWeekRelleno - 1);
    } else if (direccion === 'siguiente' && currentWeekRelleno < totalWeeksRelleno - 1) {
      setCurrentWeekRelleno(currentWeekRelleno + 1);
    }
  };

  const cambiarSemanaRiego = (direccion: 'anterior' | 'siguiente') => {
    if (direccion === 'anterior' && currentWeekRiego > 0) {
      setCurrentWeekRiego(currentWeekRiego - 1);
    } else if (direccion === 'siguiente' && currentWeekRiego < totalWeeksRiego - 1) {
      setCurrentWeekRiego(currentWeekRiego + 1);
    }
  };

  const renderRellenoChart = () => {
    if (!weeksRelleno.length || !weeksRelleno[currentWeekRelleno]?.data.length) {
      return null; // Oculta el gráfico si no hay datos
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gráfico de Relleno - {selectedMonth}</Text>
        <LineChart
          data={{
            labels: weeksRelleno[currentWeekRelleno].labels,
            datasets: [
              {
                data: weeksRelleno[currentWeekRelleno].data,
                color: () => `rgba(255, 0, 0, 0.6)`,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisSuffix=" L"
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => cambiarSemanaRelleno('anterior')} disabled={currentWeekRelleno === 0}>
            <Text style={styles.arrow}>⬅️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => cambiarSemanaRelleno('siguiente')} disabled={currentWeekRelleno === totalWeeksRelleno - 1}>
            <Text style={styles.arrow}>➡️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRiegoChart = () => {
    if (!weeksRiego.length || !weeksRiego[currentWeekRiego]?.data.length) {
      return null; // Oculta el gráfico si no hay datos
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gráfico de Riego - {selectedMonth}</Text>
        <LineChart
          data={{
            labels: weeksRiego[currentWeekRiego].labels,
            datasets: [
              {
                data: weeksRiego[currentWeekRiego].data,
                color: () => `rgba(0, 0, 255, 0.6)`,
              },
            ],
          }}
          width={Dimensions.get('window').width - 40}
          height={220}
          yAxisSuffix=" L"
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
        <View style={styles.arrowContainer}>
          <TouchableOpacity onPress={() => cambiarSemanaRiego('anterior')} disabled={currentWeekRiego === 0}>
            <Text style={styles.arrow}>⬅️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => cambiarSemanaRiego('siguiente')} disabled={currentWeekRiego === totalWeeksRiego - 1}>
            <Text style={styles.arrow}>➡️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View>
      {loadingCharts ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
        <View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginTop: 10}}>
            {databaseInfo.info_relleno && databaseInfo.info_relleno.length > 0 ? (
                <View style={{flexDirection: 'row',justifyContent: 'center',alignItems: 'center',marginTop: 10,flexWrap: 'wrap'}}>
                    <View style={{borderWidth:4,borderRadius:15,padding:10,borderColor:'#007AFF'}}>
                        <Text style={{fontSize:17,fontWeight:"bold"}}>Info Ultimo Riego</Text>
                        <Text style={{fontSize:15}}>Fecha: {databaseInfo.info_riego[databaseInfo.info_riego.length - 1].timestamp.split("T")[0]}</Text>
                        <Text style={{fontSize:15}}>Cantidad Riego: {databaseInfo.info_riego[databaseInfo.info_riego.length - 1].info_riego.cantidadRiego / 1000} L</Text>
                        <Text style={{fontSize:15}}>Fertilizante: {databaseInfo.info_riego[databaseInfo.info_riego.length - 1].info_riego.fertis}</Text>
                        <Text style={{fontSize:15}}>Temperatura: {databaseInfo.info_riego[databaseInfo.info_riego.length - 1].info_riego.tempWater}</Text>
                    </View>
                    <View style={{borderWidth:4,borderRadius:15,padding:10,marginLeft:5,borderColor:'#007AFF'}}>
                        <Text style={{fontSize:17,fontWeight:"bold"}}>Info Ultimo Relleno</Text>
                        <Text style={{fontSize:15}}>Fecha: {databaseInfo.info_relleno[databaseInfo.info_relleno.length - 1].timestamp.split("T")[0]}</Text>
                        <Text style={{fontSize:15}}>Cantidad Relleno: {databaseInfo.info_relleno[databaseInfo.info_relleno.length - 1].info_relleno.cantidadRellenar} L</Text>
                    </View>
                </View>
            ) : (
                <Text>No hay datos disponibles</Text>
            )}
        </View>

        {/* Solo muestra el botón si hay datos */}
        {databaseInfo.info_relleno && databaseInfo.info_relleno.length > 0 && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={() => filtrarUltimaSemana(databaseInfo)}>
              <Text style={styles.buttonText}>Ult. Semana</Text>
            </TouchableOpacity>

            {availableMonths.map((mes, index) => (
              <TouchableOpacity key={index} style={styles.button} onPress={() => filtrarPorMes(mes)}>
                <Text style={styles.buttonText}>{mes.replace("2024","24")}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

          {weeksRelleno.length === 0 && weeksRiego.length === 0 && (
            <Text style={styles.noDataText}>No hay datos de gráficos disponibles</Text>
          )}

          {renderRellenoChart()}
          {renderRiegoChart()}
        </>
      )}
    </View>
  );
};

const chartConfig = {
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.5,
  useShadowColorFromDataset: false,
};

const styles = StyleSheet.create({
  chartContainer: {
    marginTop: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  chartStyle: {
    borderRadius: 10,
  },
  loadingIndicator: {
    marginTop: 20,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#999',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  arrowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  arrow: {
    fontSize: 24,
    color: '#007AFF',
  },
});

export default Graficas;
