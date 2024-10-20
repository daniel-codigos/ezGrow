import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ip from "../../ips.json";
import { useRoute } from '@react-navigation/native';

const NuevaPantalla = () => {
  const [hayLuz, setHayLuz] = useState(null);
  const [lampara, setLampara] = useState({});
  const [horario, setHorario] = useState({});
  const [showEncendidoPicker, setShowEncendidoPicker] = useState(false);
  const [showApagadoPicker, setShowApagadoPicker] = useState(false);
  const [horaEncendido, setHoraEncendido] = useState(new Date());
  const [horaApagado, setHoraApagado] = useState(new Date());
  // Agregado para visualización
  const [horaEncendidoStr, setHoraEncendidoStr] = useState('');
  const [horaApagadoStr, setHoraApagadoStr] = useState('');
  const aparato_clave = "Ventilador"
  const route = useRoute();
  const { espacioName } = route.params;
  //console.log(espacioName);

  const info_aparatos = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const response = await axios.get(`http://${ip.ips.elegido}/api/pages/info_aparatos`,{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setHayLuz(false);
        } else {
          console.log(response.data)
          
          for (let index = 0; index < response.data.info.length; index++) {
            const element = response.data.info[index];
            
            if (element.info.space === espacioName && element.info.aparato === aparato_clave) {
              console.log("saveee it")
              setLampara(element.info);
            }
          if(response.data.info_horas){
            for (let index = 0; index < response.data.info_horas.length; index++) {
              const element = response.data.info_horas[index];
              console.log("loooooooorooo")
              console.log(element.info.space)
              console.log(espacioName)
              console.log(element.info.aparato)
              if (element.info.space === espacioName && element.info.aparato === aparato_clave) {
                setHorario(element.info);
                console.log(String(element.info.horaApagado))
                console.log("looool")
                ///toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                setHoraEncendidoStr(String(element.info.horaEncendido))
                setHoraApagadoStr(String(element.info.horaApagado))
              }
            }
          }
        }
        setHayLuz(true);
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  const luz_config_save = async () => {
    // Formatea la hora de encendido y apagado para enviar a tu backend
    const newLuzConfig = {
      horaEncendido: horaEncendido.toLocaleTimeString(),
      horaApagado: horaApagado.toLocaleTimeString(),
      aparato: lampara.aparato,
      regleta:lampara.regleta,
      space:espacioName
    };

    try {
      const token = await SecureStore.getItemAsync("token_ez");
      await axios.post(`http://${ip.ips.elegido}/api/pages/set_hora`, newLuzConfig, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      alert('Configuración de luz guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la configuración de la luz:', error);
      alert('Error al guardar la configuración de la luz');
    }
  };

  useEffect(() => {
    info_aparatos();
  }, []);

  const onChangeEncendido = (event, selectedDate) => {
    setShowEncendidoPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHoraEncendido(selectedDate);
      // Actualiza el texto visible
      setHoraEncendidoStr(selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const onChangeApagado = (event, selectedDate) => {
    setShowApagadoPicker(Platform.OS === 'ios');
    if (selectedDate) {
      setHoraApagado(selectedDate);
      // Actualiza el texto visible
      setHoraApagadoStr(selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }
  };

  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {hayLuz === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : hayLuz && Object.keys(lampara).length > 0 ? (
        <>
          <Text style={styles.titulo}>Configuración de Extractor</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.texto}>Regleta: {lampara.regleta}</Text>
            <Text style={styles.texto}>Aparato: {lampara.aparato}</Text>
            <TouchableOpacity style={styles.boton} onPress={() => setShowEncendidoPicker(true)}>
              <Text style={styles.botonTexto}>Configurar Encendido</Text>
            </TouchableOpacity>
            {horaEncendidoStr ? <Text style={styles.horaText}>Encendido: {horaEncendidoStr}</Text> : null}
            <TouchableOpacity style={styles.boton} onPress={() => setShowApagadoPicker(true)}>
              <Text style={styles.botonTexto}>Configurar Apagado</Text>
            </TouchableOpacity>
            {horaApagadoStr ? <Text style={styles.horaText}>Apagado: {horaApagadoStr}</Text> : null}
            <TouchableOpacity style={styles.botonGuardar} onPress={luz_config_save}>
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View>
          <Text style={styles.texto}>Oops.</Text>
          <Text style={styles.texto}>{Object.keys(lampara).length > 0 ? "" : "Debes configurar el enchufe del extractor."}</Text>
        </View>
      )}
      {/*<TouchableOpacity style={styles.boton} onPress={() => navigation.goBack()}>
        <Text style={styles.botonTexto}>Volver a Pantalla Principal</Text>
      </TouchableOpacity>*/}
      {showEncendidoPicker && (
        <DateTimePicker value={horaEncendido} mode="time" display="default" onChange={onChangeEncendido} />
      )}
      {showApagadoPicker && (
        <DateTimePicker value={horaApagado} mode="time" display="default" onChange={onChangeApagado} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f5',
    padding: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoContainer: {
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  texto: {
    fontSize: 16,
    marginVertical: 10,
  },
  boton: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 20,
    width: '80%',
    alignItems: 'center',
    marginVertical: 10,
  },
  botonGuardar: {
    marginTop: 20,
    backgroundColor: '#34C759', // Verde para el botón de guardar
    borderRadius:10,
    padding:5
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  horaText: {
    fontSize: 16,
    color: '#2c3e50', // Texto más oscuro para las horas
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default NuevaPantalla;