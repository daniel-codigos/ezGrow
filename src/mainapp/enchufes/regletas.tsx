import React, {useState, useEffect, useContext} from "react";
import { StyleSheet, View, Text, Modal, Button, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Rutinas from './rutinas'; 

const Regletas = ({ isVisible, onClose, merossData, regletaSelec, menu_accion_enchufe, menu_enchufe, setRutinasModalVisible, setEscenasModalVisible, rutinasModalVisible, espacioName }) => {
  
    const [cargando, setCargando] = useState(false);
    return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.fullScreenModalContent}>
          <View style={styles.cont_prin_regletas}>
            <View style={styles.la_regleta_in}>
              <Text style={styles.title}>{regletaSelec}</Text>
              <View style={styles.regle_cont_prin_in}>
                <View style={styles.cont_prin_enchu}>
                  {merossData.info && merossData.info.status && merossData.info.status[regletaSelec]
                    ? merossData.info.status[regletaSelec].map((enchufe, innerIndex) => (
                      <View key={innerIndex}>
                        {innerIndex === 0 ? (
                          <View>{/* Contenido si innerIndex es igual a 0 */}</View>
                        ) : innerIndex === 5 ? (
                          <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.cada_ench, { backgroundColor: enchufe.status ? 'green' : 'red' }]} onPress={async () => {
                                    setCargando(true)
                                    await menu_accion_enchufe(regletaSelec, enchufe.name, merossData, innerIndex, enchufe.status)
                                    setCargando(false)
                                }}>
                              <Icon name="usb" size={28} color="#ffffff" />
                            </Text>
                            <Text style={[styles.cada_pen_edit]} onPress={() => menu_enchufe(regletaSelec, enchufe.name, innerIndex, enchufe.status)}>
                              <Icon2 name="pen" size={19} color="#ffffff" />
                            </Text>
                          </View>
                        ) : (
                          <View style={{ flexDirection: "row" }}>
                            <Text style={[styles.cada_ench, { backgroundColor: enchufe.status ? 'green' : 'red' }]} onPress={async () => {
                                setCargando(true)
                                await menu_accion_enchufe(regletaSelec, enchufe.name, merossData, innerIndex, enchufe.status)
                                setCargando(false)
                            }}>
                              <Icon name="plug" size={30} color="#ffffff" />
                              {innerIndex}
                            </Text>
                            <Text style={[styles.cada_pen_edit]} onPress={() => menu_enchufe(regletaSelec, enchufe.name, innerIndex, enchufe.status)}>
                              <Icon2 name="pen" size={19} color="#ffffff" />
                            </Text>
                          </View>
                        )}
                      </View>
                    ))
                    : null
                  }
                    {cargando && (
                        <View style={styles.loading}>
                            <ActivityIndicator size="large" color="#0000ff" />
                        </View>
                    )}
                </View>
              </View>
            </View>
            <View style={styles.cont_names_ench}>
              {merossData.info && merossData.info.status && merossData.info.status[regletaSelec]
                ? merossData.info.status[regletaSelec].map((enchufe, innerIndex) => (
                  <View key={innerIndex}>
                    {innerIndex === 0 ? (
                      <View>{/* Contenido si innerIndex es igual a 0 */}</View>
                    ) : (
                      <View style={[styles.cada_ench_data, { backgroundColor: 'grey', flexDirection: 'row' }]}>
                        <Text style={{ marginTop: 5 }}>
                          {enchufe.name}
                        </Text>
                      </View>
                    )}
                  </View>
                ))
                : null
              }
            </View>
            
          </View>
          <View style={styles.btn_rutinas}>
            <Button title="Rutinas1" onPress={() => {
              console.log("vamos a rutinas cabronnn")
              setRutinasModalVisible(true)
            }} />
          </View>
          <View style={styles.btn_rutinas}>
            <Button title="Escenas" onPress={() => setEscenasModalVisible(true)} />
          </View>
          {rutinasModalVisible &&
            <Rutinas
              visible={rutinasModalVisible}
              onClose={() => setRutinasModalVisible(false)}
              info={{ 'merossData': merossData, "master": regletaSelec, "space": espacioName, "mod": null }}
            />}
          <Button title="Cerrar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    modalBackground: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    fullScreenModalContent: {
      height: '95%',
      width: '100%',
      backgroundColor: 'white',
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    cont_prin_regletas: {
      flex: 1,
      flexDirection: "row",
    },
    la_regleta_in: {
      flexWrap: "wrap",
      padding: 20,
    },
    regle_cont_prin_in: {
      flexDirection: "column",
      flexWrap: "wrap",
      backgroundColor: '#007AFF',
      borderRadius: 15
    },
    cont_prin_enchu: {
      flexDirection: "column",
      flexWrap: "wrap",
      padding: 20,
    },
    cada_ench: {
      backgroundColor: '#007AFF',
      paddingLeft: 8,
      marginBottom: 50,
      flexWrap: 'wrap',
      paddingTop: 5,
      borderRadius: 15,
      width: 50,
      height: 50,
    },
    cada_pen_edit: {
      paddingLeft: 20,
      marginLeft: 5,
      flexWrap: 'wrap',
      paddingTop: 8,
      borderRadius: 15,
      width: 40,
      height: 40,
    },
    cont_names_ench: {
      flexDirection: "column",
      paddingTop: 60,
    },
    cada_ench_data: {
      backgroundColor: '#007AFF',
      marginTop: 10,
      padding: 8,
      marginBottom: 50,
      flexWrap: 'wrap',
      borderRadius: 5,
      alignItems: 'center',
      justifyContent: "center",
      alignContent: "center",
    },
    btn_rutinas: {
      justifyContent: "center",
      alignItems: "center",
      alignContent: "flex-end",
      marginBottom: 10,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
    },
    loading: {
        backgroundColor:'white',
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
  

export default Regletas;
