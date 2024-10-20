import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ip from "../../ips.json";
import { Button } from 'react-native-elements'; // Importamos Button de react-native-elements
import { useRoute } from '@react-navigation/native';

const NuevaPantalla = () => {
  const [hayLuz, setHayLuz] = useState(null);
  const [haySensor, setHaySensor] = useState(null);
  const [infoSensores, setInfoSensores] = useState({});
  const [lampara, setLampara] = useState({});
  const [infoStatus, setInfoStatus] = useState({});
  const [horaEncendidoStr, setHoraEncendidoStr] = useState('');
  const [horaApagadoStr, setHoraApagadoStr] = useState('');
  const [horario, setHorario] = useState({});
  const aparato_clave = "Lampara"
  const route = useRoute();
  const { espacioName } = route.params;
  console.log(espacioName);

  const info_sensores = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setHaySensor(false);
        } else {
          console.log(response.data)
          for (let index = 0; index < response.data.length; index++) {
            const element = response.data[index];
            console.log(element)
            if (element.info.esp_cat === espacioName){
                if (element.info.topic === "sen_temp_hume"){
                  console.log("afirmativo, tiene sensor de temp por lo q puede tener ventilador.")
                  setInfoSensores(element)
                  info_rutinas()
                  //ver que tiene el aparato listo tmbn
                  setHaySensor(true)
                }

            }else{
              setHaySensor(false)
            }
          }
          
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHaySensor(false);
    }
  };

  const info_rutinas = async () => {
    //reemplazar en api los names de los enchufes por los de la db...
    try {
      console.log("hjoderrrrrrrrrr")
      const token = await SecureStore.getItemAsync("token_ez")
      const fin = {'space':espacioName}
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/ver_rutinas', {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        if ('Error' in response.data) {
          console.log('error rutinas')
          //setRutinas([''])
        }else{
          console.log('lahsdjkhaskjd')
          response.data.forEach(cada_rutina => {
            console.log(cada_rutina.info.nombre)
            if (cada_rutina.info.nombre === "luces"){
              setHoraApagadoStr(cada_rutina.info.horario_off)
              setHoraEncendidoStr(cada_rutina.info.horario_on)
              console.log(cada_rutina)
              console.log(cada_rutina.info.horario_off)
              console.log(cada_rutina.info.horario_on)
            }
          });
          //setRutinas(response.data)
          info_aparatos();
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  };
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
            console.log(element)
            if (element.info.space === espacioName && element.info.aparato === aparato_clave) {
              setLampara(element.info);
            }
          }
          if (response.data.info_status) {
            console.log("esto es status:")
            console.log(response.data.info_status)
            setInfoStatus(response.data.info_status)
          }

          setHayLuz(true);
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  const accion_lampara = async (accion) => {
    const finalInfo = {"regleta":lampara.regleta,"name":lampara.name,"channel":lampara.numChannel,'estado':infoStatus[lampara.regleta][lampara.numChannel]['status'],'accion':accion,'space':espacioName}
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/usar_enchufes`, {finalInfo},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        console.log("jajajaja")
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
    }
  };


  useEffect(() => {
    info_sensores();
  }, []);

  const navigation = useNavigation();

  const volverAPantallaPrincipal = () => {
    navigation.goBack();
  };

  if (hayLuz === null && haySensor === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando datos, un momento.</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        
        {hayLuz && haySensor && Object.keys(lampara).length > 0 ? (
          <>
          <View style={styles.infoContainer}>
            <Text>Regleta: {lampara.regleta}</Text>
            <Text>{lampara.aparato}</Text>
            <Text>Estado:{infoStatus[lampara.regleta][lampara.numChannel]['status'] ? 'Encendido' : 'Apagado'}</Text>
            {horaEncendidoStr && horaApagadoStr ? 
            <View>
              <Text style={styles.horaText}>Encendido: {horaEncendidoStr}</Text> 
              <Text style={styles.horaText}>Apagado: {horaApagadoStr}</Text>
            </View>
            : 
            <Text style={styles.horaText}>Horario no configurado aun!</Text> 
            }
            
            <Button
              title="Encender"
              onPress={() => accion_lampara('on')}
              buttonStyle={styles.botonEncender}
              icon={{ name: 'power-off', type: 'font-awesome', color: 'white' }}
            />
            <Button
              title="Apagar"
              onPress={() => accion_lampara('off')}
              buttonStyle={styles.botonApagar}
              icon={{ name: 'power-off', type: 'font-awesome', color: 'white' }}
            />
            </View>
          </>
          
        ) : (
          <View>
            <Text style={styles.texto}>Parece que aun no se ha configurado el escenario de enchufes.</Text>
            <Text style={styles.texto}>{hayLuz ? "" : "Configura bien tu lampara en enchufes."}</Text>
            <Text style={styles.texto}>{haySensor ? "" : "Configura bien tu sensor de Luminosidad."}</Text>
          </View>
        )}
        <Button title="Volver a Pantalla Principal" onPress={volverAPantallaPrincipal} type="clear" />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  texto: {
    textAlign: 'center',
    marginVertical: 20,
  },
  botonEncender: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 10,
  },
  botonApagar: {
    backgroundColor: '#dc3545',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    marginVertical: 10,
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
  horaText: {
    fontSize: 16,
    color: '#2c3e50', // Texto más oscuro para las horas
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default NuevaPantalla;
