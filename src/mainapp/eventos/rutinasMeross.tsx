  import React, { useState, useEffect } from 'react';
  import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
  import { useNavigation } from '@react-navigation/native';
  import { useRoute } from '@react-navigation/native';
  import Icon2 from 'react-native-vector-icons/FontAwesome5';
  import * as SecureStore from 'expo-secure-store';
  import axios from 'axios';
  import ip from "../../ips.json";
  import Rutinas from '../enchufes/rutinas';
  
  const NuevaPantalla = () => {
    const [hayLuz, setHayLuz] = useState(null);
    const [merossData, setMerossData] = useState({});
    const [rutinas, setRutinas] = useState([]);
    const [editRutina, setEditRutina] = useState([]);
    const [rutinasModalVisible, setRutinasModalVisible] = useState(false);
    const [regletaSelec, setRegletaSelec] = useState('');
    const [selectedRutina, setSelectedRutina] = useState(null);
    
    const route = useRoute();
    const { espacioName } = route.params;
  
    const info_rutinas = async () => {
      try {
        const token = await SecureStore.getItemAsync("token_ez");
        const fin = { 'space': espacioName };
        const response = await axios.post(`http://${ip.ips.elegido}/api/pages/ver_rutinas`, { fin }, {
          headers: {
            'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          }
        });
        if (response.status === 200) {
          if ('Error' in response.data) {
            console.log('Error al obtener rutinas');
          } else {
            setRutinas(response.data);
            takeUser_meross();
          }
        }
      } catch (error) {
        console.error('Error al obtener rutinas:', error);
      }
    };
  
    const del_rutinas = async (laktoka) => {
      try {
        const token = await SecureStore.getItemAsync("token_ez");
        const fin = { 'space': espacioName, 'del': laktoka};
        const response = await axios.post(`http://${ip.ips.elegido}/api/pages/del_rutinas`, { fin }, {
          headers: {
            'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          }
        });
        if (response.status === 200) {
          if ('Error' in response.data) {
            console.log('Error al obtener rutinas');
          } else {
            console.log("delete")
            //setRutinas(response.data);
            //takeUser_meross();
          }
        }
      } catch (error) {
        console.error('Error al obtener rutinas:', error);
      }
    };

    const takeUser_meross = async () => {
      try {
        const token = await SecureStore.getItemAsync("token_ez");
        const fin = { 'space': espacioName };
        const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_enchufes`, { fin }, {
          headers: {
            'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          }
        });
        if (response.status === 200) {
          if ('Error' in response.data) {
            setMerossData('NoUser');
          } else {
            setMerossData(response.data);
            setHayLuz(true);
          }
        }
      } catch (error) {
        console.error('Error al obtener información de enchufes:', error);
      }
    };
  
    const edit_rutina = (numero) => {
      setEditRutina([]);
      setRegletaSelec(rutinas[numero].info.regleta);
      setEditRutina(rutinas[numero]);
      setRutinasModalVisible(true);
    };
  
    const select_rutina = (index) => {
      setSelectedRutina(index === selectedRutina ? null : index);
    };
  
    const delete_rutina = async () => {
      if (selectedRutina !== null) {
        console.log("borramos weeeey")
        console.log(rutinas[selectedRutina])
        del_rutinas(rutinas[selectedRutina])
        const updatedRutinas = [...rutinas];
        updatedRutinas.splice(selectedRutina, 1);
        setRutinas(updatedRutinas);
        setSelectedRutina(null);
      }
    };
  
    useEffect(() => {
      info_rutinas();
    }, []);
  
    return (
      <View style={styles.container}>
        {hayLuz === null ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : hayLuz ? (
          <>
            <Text style={styles.titulo}>Eventos en {espacioName}</Text>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              {rutinas.map((rutina, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.rutinaContainer,
                    selectedRutina === index ? styles.rutinaSeleccionada : null,
                  ]}
                  onPress={() => select_rutina(index)}
                >
                  <View style={styles.rutinaHeader}>
                    <Text style={styles.rutinaNombre}>{rutina.info.nombre}</Text>
                    <View style={styles.iconButtons}>
                      <TouchableOpacity onPress={() => edit_rutina(index)} style={styles.editButton}>
                        <Icon2 name="pen" size={18} color="white" />
                      </TouchableOpacity>
                      {selectedRutina === index && (
                        <TouchableOpacity onPress={delete_rutina} style={styles.deleteButton}>
                          <Icon2 name="trash" size={18} color="white" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                  <View style={styles.rutinaContent}>
                    <Text style={styles.texto}>Regleta: {rutina.info.regleta}</Text>
                    <Text style={styles.texto}>Hora ON: {rutina.info.horario_on}</Text>
                    <Text style={styles.texto}>Hora OFF: {rutina.info.horario_off}</Text>
                    <View style={styles.diasContainer}>
                      {Object.values(rutina.info.dias).every(value => value) ? (
                        <Text style={styles.diaTexto}>Todos los días</Text>
                      ) : (
                        Object.entries(rutina.info.dias)
                          .filter(([dia, activo]) => activo)
                          .map(([dia], idx) => (
                            <Text key={idx} style={styles.diaTexto}>
                              {dia[0].toUpperCase()}
                            </Text>
                          ))
                      )}
                    </View>
                    <View style={styles.aparatosContainer}>
                      {rutina.info.aparatos.map((aparato, idx) => (
                        <View key={idx} style={styles.aparatoItem}>
                          <Icon2 name="plug" size={14} color="#3897f0" />
                          <Text style={styles.textoAparato}>{aparato.aparato}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
  
              {rutinasModalVisible && (
                <Rutinas
                  visible={rutinasModalVisible}
                  onClose={() => setRutinasModalVisible(false)}
                  info={{ merossData, master: regletaSelec, space: espacioName, mod: editRutina }}
                />
              )}
            </ScrollView>
          </>
        ) : (
          <View>
            <Text style={styles.texto}>No se encontraron configuraciones disponibles.</Text>
          </View>
        )}
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 30,
      backgroundColor: '#f0f0f5',
      paddingHorizontal: 20,
    },
    scrollContainer: {
      paddingBottom: 30,
    },
    titulo: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
      color: '#333',
    },
    rutinaContainer: {
      backgroundColor: '#ffffff',
      borderRadius: 10,
      padding: 15,
      marginBottom: 15,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    rutinaSeleccionada: {
      backgroundColor: '#f8d7da',
    },
    rutinaHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    rutinaNombre: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
    },
    iconButtons: {
      flexDirection: 'row',
    },
    editButton: {
      backgroundColor: '#3897f0',
      padding: 8,
      borderRadius: 50,
      marginRight: 10,
    },
    deleteButton: {
      backgroundColor: '#d9534f',
      padding: 8,
      borderRadius: 50,
    },
    rutinaContent: {
      paddingLeft: 5,
    },
    texto: {
      fontSize: 16,
      color: '#444',
      marginBottom: 5,
    },
    diasContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginVertical: 10,
    },
    diaTexto: {
      fontSize: 14,
      backgroundColor: '#ffcc00',
      color: '#fff',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 5,
      marginRight: 5,
      marginBottom: 5,
    },
    aparatosContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    aparatoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 10,
      marginBottom: 5,
    },
    textoAparato: {
      fontSize: 14,
      color: '#3897f0',
      marginLeft: 5,
    },
  });
  
  export default NuevaPantalla;
  