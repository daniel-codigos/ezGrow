import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import ip from "../../ips.json";
import moment from 'moment';

const { width, height } = Dimensions.get('window'); // Obtener dimensiones de la pantalla

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
        console.log(response.data.info_relleno)
        console.log("+++-+-+--+-+-+-+--+-+-+-+-+-+--+--+")
        setDatabaseInfo(response.data);
        if (response.data.info_relleno.length > 0) {
          setAvailableMonths([
            ...new Set(
              response.data.info_relleno
                .filter((item: any) => item && item.timestamp)
                .map((item: any) => item.timestamp.slice(0, 10))
            ),
          ]);
          filtrarUltimaSemana(response.data); // Mostrar la última semana registrada por defecto
        }
      } else {
        console.error("Error al obtener información de la base de datos");
      }
      setLoadingCharts(false);
    } catch (error) {
      console.error('Error al obtener información de la base de datos:', error);
      setLoadingCharts(false);
    }
  };

  const filtrarUltimaSemana = (data: any) => {
    if (data.info_relleno.length === 0 && data.info_riego.length === 0) {
      return;
    }

    const labelsRelleno = data.info_relleno.length > 0
      ? data.info_relleno.map((item: any) => item.timestamp.slice(8, 10))
      : [];

    const dataRelleno = data.info_relleno.length > 0
      ? data.info_relleno.map((item: any) => Number(item.info_relleno.cantidadRellenar) || 0)
      : [];

    const labelsRiego = data.info_riego.length > 0
      ? data.info_riego.map((item: any) => item.timestamp.slice(8, 10))
      : [];

    const dataRiego = data.info_riego.length > 0
      ? data.info_riego.map((item: any) => Number(item.info_riego.cantidadRiego / 1000) || 0)
      : [];

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

  const renderRellenoChart = () => {
    if (!weeksRelleno.length || !weeksRelleno[currentWeekRelleno]?.data.length) {
      return <Text style={styles.noDataText}>No hay información aún de relleno</Text>;
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gráfico de Relleno - {selectedMonth}</Text>
        <LineChart
          data={{
            labels: weeksRelleno[currentWeekRelleno].labels,
            datasets: [{ data: weeksRelleno[currentWeekRelleno].data.filter(value => typeof value === 'number'), color: () => `rgba(255, 0, 0, 0.6)` }],
          }}
          width={width * 0.85} // Responsive
          height={height * 0.35} // Responsive
          yAxisSuffix=" L"
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
      </View>
    );
  };

  const renderRiegoChart = () => {
    if (!weeksRiego.length || !weeksRiego[currentWeekRiego]?.data.length) {
      return <Text style={styles.noDataText}>No hay información aún de riego</Text>;
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Gráfico de Riego - {selectedMonth}</Text>
        <LineChart
          data={{
            labels: weeksRiego[currentWeekRiego].labels,
            datasets: [{ data: weeksRiego[currentWeekRiego].data.filter(value => typeof value === 'number'), color: () => `rgba(0, 0, 255, 0.6)` }],
          }}
          width={width * 0.85} // Responsive
          height={height * 0.35} // Responsive
          yAxisSuffix=" L"
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />
      </View>
    );
  };

  return (
    <View>
      {loadingCharts ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loadingIndicator} />
      ) : (
        <>
          <View style={styles.infoContainer}>
            {databaseInfo.info_relleno && databaseInfo.info_relleno.length > 0 ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Info Último Relleno</Text>
                <Text style={styles.infoText}>Fecha: {databaseInfo.info_relleno[databaseInfo.info_relleno.length - 1].timestamp.split("T")[0]}</Text>
                <Text style={styles.infoText}>Cantidad Relleno: {databaseInfo.info_relleno[databaseInfo.info_relleno.length - 1].info_relleno.cantidadRellenar} L</Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>No hay información aún de relleno</Text>
            )}

            {databaseInfo.info_riego && databaseInfo.info_riego.length > 0 ? (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>Info Último Riego</Text>
                <Text style={styles.infoText}>Fecha: {databaseInfo.info_riego[databaseInfo.info_riego.length - 1].timestamp.split("T")[0]}</Text>
                <Text style={styles.infoText}>Cantidad Riego: {databaseInfo.info_riego[databaseInfo.info_riego.length - 1].info_riego.cantidadRiego / 1000} L</Text>
              </View>
            ) : (
              <Text style={styles.noDataText}>No hay información aún de riego</Text>
            )}
          </View>

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
    marginTop: height * 0.02,
    backgroundColor: '#ffffff',
    borderRadius: width * 0.02,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: height * 0.01,
  },
  chartStyle: {
    borderRadius: width * 0.02,
    //backgroundColor:"#dcdcdc"
  },
  loadingIndicator: {
    marginTop: height * 0.02,
  },
  noDataText: {
    textAlign: 'center',
    fontSize: width * 0.045,
    color: '#999',
  },
  infoContainer: {
    marginTop:20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    marginBottom: height * 0.02,
  },
  infoCard: {
    backgroundColor:"#dcdcdc",
    borderWidth: 2,
    borderRadius: width * 0.02,
    padding: width * 0.04,
    borderColor: '#007AFF',
    width: width * 0.4,
    marginBottom: height * 0.02,
  },
  infoTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  infoText: {
    fontSize: width * 0.04,
    marginBottom: height * 0.005,
  },
});

export default Graficas;

