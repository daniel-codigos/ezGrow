import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import ip from "../../ips.json";

interface InfoModalProps {
  isVisible: boolean;
  onClose: () => void;
  data: any; // Ajusta el tipo según tus datos
}

const InfoModal: React.FC<InfoModalProps> = ({ isVisible, onClose, data }) => {
  const [infoBidones, setInfoBidones] = useState([]);
  const [infoBidonesActualizado, setInfoBidonesActualizado] = useState(false);
  const [litrosBidon, setLitrosBidon] = useState('');
  
  const info_bidones = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': data.space };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_bidones`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("Error al obtener información de bidones");
          onClose()
        } else {
          response.data.forEach(element => {
            if (element.info.space === data.space) {
              console.log('bidones AQIII brooo')
              console.log(element.info)
              setInfoBidones(prevInfoBidones => [...prevInfoBidones, element.info]);
              setInfoBidonesActualizado(true);
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      onClose()
    }
  };

  const empieza = () => {
    console.log(data);
    console.log('feooooooooooo');
    if (data.distancia) {
      console.log(data);
      if (data.name && data.name.includes("relleno")) {  // Comprobamos si data.name está definido antes de usar includes
        console.log('loko esete siii');
        info_bidones();
        infoBidones.forEach(cadaBidon => {
          if (cadaBidon.tipo === 'rellena') {
            console.log("es riego");
            const ahora = data.distancia;
            const total = cadaBidon.distVacio;
            const Lespacio = total - cadaBidon.dist1L;
            const ahoraEspacio = total - ahora;
            const finito = (ahoraEspacio / Lespacio) * 2;
            console.log(finito);
            setLitrosBidon(finito.toFixed(2));
          }
        });
      } else {
        info_bidones();
        infoBidones.forEach(cadaBidon => {
          if (cadaBidon.tipo === 'riego') {
            console.log("es riego");
            const ahora = data.distancia;
            const total = cadaBidon.distVacio;
            const Lespacio = total - cadaBidon.dist1L;
            const ahoraEspacio = total - ahora;
            const finito = ahoraEspacio / Lespacio;
            console.log(finito);
            setLitrosBidon(finito.toFixed(2));
          }
        });
      }
    }
  };

  useEffect(() => {
    if (isVisible) {
      empieza();
    }
  }, [isVisible]);

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose}>
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Información del Sensor</Text>
        {
          data.info === "sen_water_dist" ? 
            <Text style={styles.modalText}>distancia: {data.distancia}</Text>
          : 
          data.info === "sen_hume_tierra" && data.sensores ? 
            Object.entries(data.sensores).map(([id, value]) => (
              <Text key={id} style={styles.modalText}>sensor {id} {"->"} valor: {value}</Text>
            ))
          : 
          data.humedad ? 
            <Text style={styles.modalText}>temperatura: {data.temperatura}ºC / Humedad: {data.humedad}</Text>
          :
            <Text style={styles.modalText}>temperatura: {data.temperatura} ºC</Text>
        }
        {
          data.distancia && litrosBidon !== '' ?
            <Text style={styles.modalText}>Litros: {litrosBidon}</Text>
          :
            null
        }


        <Text style={styles.modalText}>Categoría: {data.space}</Text>
        <Text style={styles.modalText}>Tipo: {data.info}</Text>
        <Text style={styles.modalText}>Token: {data.token}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Cerrar</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default InfoModal;
