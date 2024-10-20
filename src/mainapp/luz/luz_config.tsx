import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ip from "../../ips.json";
import { useRoute } from '@react-navigation/native';

const NuevaPantalla = () => {
  const [hayLuz, setHayLuz] = useState(null);
  const [merossData,setMerossData] = useState({})
  const [lampara, setLampara] = useState({});
  const [aparatos, setAparatos] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [aparatoSeleccionado, setAparatoSeleccionado] = useState('');
  const [horario, setHorario] = useState({});
  const aparato_clave = "Lampara"
  const [showEncendidoPicker, setShowEncendidoPicker] = useState(false);
  const [showApagadoPicker, setShowApagadoPicker] = useState(false);
  const [horaEncendido, setHoraEncendido] = useState(new Date());
  const [horaApagado, setHoraApagado] = useState(new Date());
  const [horaEncendidoStr, setHoraEncendidoStr] = useState('');
  const [horaApagadoStr, setHoraApagadoStr] = useState('');
  const route = useRoute();
  const { espacioName } = route.params;




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
          setRutinas(response.data)
          info_aparatos();
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  };
  const takeUser_meross = async () => {
    //reemplazar en api los names de los enchufes por los de la db...
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const fin = {'space':espacioName}
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/info_enchufes', {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        if ('Error' in response.data) {
          console.log('errorraMEEENNN jajaja')
          setMerossData('NoUser')
        }else{
          setMerossData(response.data)
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
      const response = await axios.get(`http://${ip.ips.elegido}/api/pages/info_aparatos`, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setHayLuz(false);
        } else {
          console.log(response.data);

          const filteredAparatos = response.data.info.filter((item) =>
            item.info.space === espacioName && item.info.aparato === "Lampara"
          );
          const filteredHoras = response.data.info_horas.filter((item) =>
            item.info.space === espacioName && item.info.aparato === "Lampara"
          );
          console.log("ostiiiiaaaa")
          console.log(filteredAparatos)
          setAparatos(filteredAparatos);
          if (filteredAparatos.length > 0) {
            setAparatoSeleccionado(filteredAparatos[0].info.aparato);
            setLampara(filteredAparatos[0].info);
            //setHorario(filteredHoras[0].info);
            //setHoraEncendidoStr(String(filteredHoras[0].info.horaEncendido))
            //setHoraApagadoStr(String(filteredHoras[0].info.horaApagado))
            takeUser_meross()
          }

          setHayLuz(true);
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };
  const guardarRutina = async () => {
    try {
      let lanip = ''
      merossData.info.data.forEach(cada_regleta => {
          if (cada_regleta.name === lampara.regleta) {
              console.log(cada_regleta.lan_ip)
              lanip = cada_regleta.lan_ip
          }
      });
      let uuid = ''
      const userKey = merossData.info.user_meross_info.info.key
      //console.log(info)
      console.log(merossData.info.data)
      merossData.info.data.forEach(cada_regleta => {
        if (cada_regleta.name === lampara.regleta) {
          console.log(cada_regleta.uuid)
          uuid = cada_regleta.uuid
        }
      });
      const token = await SecureStore.getItemAsync("token_ez")
      const fin = {'info':{"lanip":lanip,"aparatos":[lampara],'dias':{"lunes": true, "martes": true, "miercoles": true, "jueves": true, "viernes": true, "sabado": true, "domingo": true},'horario_on':horaEncendidoStr,'horario_off':horaApagadoStr,'uuid':uuid,'nombre':'luces','space':espacioName}}
      console.log(fin)
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/crear_rutina', {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        //setMerossData(response.data)
        console.log(response.data)
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  };

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

  useEffect(() => {
    info_rutinas()
  }, []);


  return (
    <View style={styles.container}>
      {!hayLuz === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : hayLuz && aparatos.length > 0 ? (
        <>
          <Text style={styles.titulo}>Configuración de Luz para {espacioName}</Text>
          <View style={styles.infoContainer}>
          <Text style={styles.texto}>Regleta: {lampara.regleta}</Text>
          <View style={{"flexDirection":"row"}}>
            <Text style={styles.texto}>Aparato:</Text>
              <Picker
                selectedValue={aparatoSeleccionado}
                style={{ height: 50, width: 150 }}
                onValueChange={(itemValue, itemIndex) => setAparatoSeleccionado(itemValue)}
              >
                {aparatos.map((ap, index) => (
                  <Picker.Item key={index} label={ap.info.regleta+"-"+ap.info.aparato} value={ap.info.aparato} />
                ))}
              </Picker>
          </View>

            <TouchableOpacity style={styles.boton} onPress={() => setShowEncendidoPicker(true)}>
              <Text style={styles.botonTexto}>Configurar Encendido</Text>
            </TouchableOpacity>
            {horaEncendidoStr ? <Text style={styles.horaText}>Encendido: {horaEncendidoStr}</Text> : null}
            <TouchableOpacity style={styles.boton} onPress={() => setShowApagadoPicker(true)}>
              <Text style={styles.botonTexto}>Configurar Apagado</Text>
            </TouchableOpacity>
            {horaApagadoStr ? <Text style={styles.horaText}>Apagado: {horaApagadoStr}</Text> : null}
            <TouchableOpacity style={styles.botonGuardar} onPress={guardarRutina}>
              <Text style={styles.botonTexto}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View>
          <Text style={styles.texto}>No se encontraron configuraciones disponibles.</Text>
        </View>
      )}
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