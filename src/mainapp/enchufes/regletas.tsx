import React, { useState } from "react";
import { StyleSheet, View, Text, Modal, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Rutinas from "./rutinas"; 

const Regletas = ({ isVisible, onClose, merossData, regletaSelec, menu_accion_enchufe, menu_enchufe, setRutinasModalVisible, setEscenasModalVisible, rutinasModalVisible, espacioName }) => {
  const [cargando, setCargando] = useState(false);

  const cargar = async (enchufe,innerIndex) => {
    setCargando(true);
    console.log("se puse cargando weyyyy")
    await menu_accion_enchufe(regletaSelec, enchufe.name, merossData, innerIndex, enchufe.status);
    setCargando(false);
  };

  return (
    <Modal
      transparent={true}
      visible={isVisible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.fullScreenModalContent}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.title}>{regletaSelec}</Text>

            <View style={styles.mainContent}>
              {/* Left Panel */}
              <View style={styles.enchufePanel}>
                {merossData.info && merossData.info.status && merossData.info.status[regletaSelec] ? (
                  merossData.info.status[regletaSelec].map((enchufe, innerIndex) => (
                    <View key={innerIndex} style={styles.enchufeContainer}>
                      <TouchableOpacity
                        style={[
                          styles.enchufeButton,
                          { backgroundColor: cargando ? 'black' : enchufe.status ? '#68c4af' : '#ff8b94' }
                        ]}
                        onPress={() => {
                          cargar(enchufe,innerIndex)
                        }}
                      >
                        <Icon name={innerIndex === 5 ? "usb" : "plug"} size={28} color="#FFFFFF" />
                        <Text style={styles.enchufeLabel}>{innerIndex}</Text>
                      </TouchableOpacity>
                      {/*panel de nombres*/}
                        <View key={innerIndex} style={styles.nameContainer}>
                          <Text style={styles.nameText}>{enchufe.name}</Text>
                        </View>
                        {cargando && (  
                          <View style={styles.loading}>
                            <ActivityIndicator size="small" color="#007AFF" />
                          </View>
                        )}
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => menu_enchufe(regletaSelec, enchufe.name, innerIndex, enchufe.status)}
                      >
                        <Icon2 name="pen" size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>

                    
                  ))
                ) : (
                  <Text style={styles.noDataText}>No hay datos disponibles</Text>
                )}

              </View>

            </View>



            {/* Buttons */}
            <View style={styles.footerButtons}>
              <TouchableOpacity
                style={styles.rutinasButton}
                onPress={() => setRutinasModalVisible(true)}
              >
                <Text style={styles.buttonText}>Rutinas</Text>
              </TouchableOpacity>
              {rutinasModalVisible &&
                <Rutinas
                  visible={rutinasModalVisible}
                  onClose={() => setRutinasModalVisible(false)}
                  info={{ 'merossData': merossData, "master": regletaSelec, "space": espacioName, "mod": null }}
              />}

              <TouchableOpacity
                style={styles.escenasButton}
                onPress={() => setEscenasModalVisible(true)}
              >
                <Text style={styles.buttonText}>Escenas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
              >
                <Text style={styles.buttonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#007AFF',
  },
  mainContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  enchufePanel: {
    flex: 1,
    backgroundColor: '#ffdfba',
    borderRadius: 15,
    padding: 15,
  },
  enchufeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  enchufeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  enchufeLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    marginTop: 5,
    textAlign: 'center',
  },
  editButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute', // Posición absoluta
    right: 10, // Pegado al borde derecho
    top: '50%', // Centrado verticalmente
    transform: [{ translateY: -15 }], // Ajusta el centrado según la altura del botón
  },
  
  namesPanel: {
    flex: 1,
    marginLeft: 15,
  },
  nameContainer: {
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  nameText: {
    fontSize: 14,
    color: '#333333',
  },
  noDataText: {
    textAlign: 'center',
    color: '#888888',
    fontSize: 16,
  },
  footerButtons: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  rutinasButton: {
    backgroundColor: '#34C759',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  escenasButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loading: {
    //position: 'absolute',
    //top: '50%',
    //left: '50%',
    //transform: [{ translateX: -25 }, { translateY: -25 }],
    marginBottom:10
  },
});

export default Regletas;

