// Rutinas.tsx
import React, {useState, useEffect, useContext} from "react";
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, TouchableOpacity, Modal, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import ip from "../../ips.json"
import axios from 'axios';
import { Input } from "react-native-elements";


const Rutinas = ({ visible, onClose , info}) => {
  const initialState = {
    lunes: false,
    martes: false,
    miercoles: false,
    jueves: false,
    viernes: false,
    sabado: false,
    domingo: false
};
  const { espacioName } = info.space;
  const [aparatos, setAparatos] = useState([]);
  const [showEncendidoPicker, setShowEncendidoPicker] = useState(false);
  const [showApagadoPicker, setShowApagadoPicker] = useState(false);
  const [horaEncendido, setHoraEncendido] = useState(new Date());
  const [horaApagado, setHoraApagado] = useState(new Date());
  // Agregado para visualización
  const [horaEncendidoStr, setHoraEncendidoStr] = useState('');
  const [horaApagadoStr, setHoraApagadoStr] = useState('');
  const [nombreRutina, setNombreRutina] = useState('');
  const [dias, setDias] = useState(initialState);
  let lanip = ''

  useEffect(() => {
    
    info.merossData.info.data.forEach(cada_regleta => {
      console.log("fliiiii")
      console.log(cada_regleta.name)
      console.log(info.master)
        if (cada_regleta.name === info.master) {
            console.log("flipas")
            console.log(cada_regleta.lan_ip)
            lanip = cada_regleta.lan_ip
        }
    });

    if (info.mod !== null) {
      console.log("tenemos que rellenar broder jejejaja")
      console.log(info.mod.info.nombre)
      console.log(info.mod.info.aparatos)
      setNombreRutina(String(info.mod.info.nombre))
      setHoraApagadoStr(info.mod.info.horario_off)
      setHoraEncendidoStr(info.mod.info.horario_on)
      setDias(info.mod.info.dias)
      info.mod.info.aparatos?.forEach(cada_apa => {
        console.log("loco aqui loco ha")
        console.log(cada_apa)
        console.log(aparatos)
        toggleAparatos(cada_apa)
      });
      //toggleAparatos(info.mod.info.aparatos)

    }else{
      console.log("crear normal")
    }
  }, []); 

const toggleDia = (dia) => {
  setDias(prevDias => ({
      ...prevDias,
      [dia]: !prevDias[dia]
  }));
  //console.log(dias)
};

const del_rutinas = async () => {
  try {
    const token = await SecureStore.getItemAsync("token_ez");
    const fin = { 'space': espacioName };
    const response = await axios.post(`http://${ip.ips.elegido}/api/pages/del_rutinas`, { fin }, {
      headers: {
        'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
      }
    });
    if (response.status === 200) {
      if ('Error' in response.data) {
        console.log('Error al obtener rutinas');
      } else {
        console.log("delete cabrtonnn")
      }
    }
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
  }
};


const toggleAparatos = (aparato) => {
  //console.log(aparato)
  setAparatos(prev => {
    // Comprobar si el aparato ya está seleccionado
    console.log(prev)
    const index = prev.findIndex(x => x.aparato === aparato.aparato && x.regleta === aparato.regleta);
    console.log(index)
    if (index >= 0) {
      // Si ya está, lo quitamos
      return [...prev.slice(0, index), ...prev.slice(index + 1)];
    } else {
      // Si no está, lo añadimos
      console.log('aqui q fuyimo')
      return [...prev, aparato];
    }
  });
};

    const onChangeApagado = (event, selectedDate) => {
        setShowApagadoPicker(Platform.OS === 'ios');
        if (selectedDate) {
          setHoraApagado(selectedDate);
          // Actualiza el texto visible
          setHoraApagadoStr(selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
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

    


    const guardarRutina = async () => {
      try {
        let uuid, lanip
        const userKey = info.merossData.info.user_meross_info.info.key
        //console.log(info)
        console.log(info.merossData.info.data)
        info.merossData.info.data.forEach(cada_regleta => {
          if (cada_regleta.name === info.master) {
            console.log(cada_regleta.uuid)
            uuid = cada_regleta.uuid
            lanip = cada_regleta.lan_ip
          }
        });
        console.log(info.master)
        const token = await SecureStore.getItemAsync("token_ez")
        const fin = {'info':{"lanip":lanip,"aparatos":aparatos,'dias':dias,'horario_on':horaEncendidoStr,'horario_off':horaApagadoStr,'uuid':uuid,'nombre':nombreRutina,'space':info.space,'regleta':info.master}}
        console.log(fin)
        const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/crear_rutina', {fin},{
          headers: {
            'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          }
        });
        onClose()
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
    //const nuevosAparatos = info.merossData.info.aparatos.filter(cada_enchufe => cada_enchufe.regleta === info.master);
    //setAparatos(nuevosAparatos);

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Contenido de Rutinas {lanip}</Text>
          <View style={{'flexDirection':'row','alignContent':'center','alignItems':'center'}}>
            <Text style={styles.modalText}>Nombre de la rutina:</Text>
            <TextInput
                        style={styles.modalInput}
                        value={nombreRutina}
                        onChangeText={(text) => setNombreRutina(text)}
                      />
          </View>
          <View style={{'flexDirection':'row'}}>
          {Object.entries(dias)?.map(([dia, valor]) => (
            <View style={{ flexDirection: 'row' }} key={dia}>
                <TouchableOpacity
                    style={[
                      styles.btnDias,
                      {backgroundColor: valor ? 'orange' : '#2196F3'}
                  ]}
                    onPress={() => toggleDia(dia)}>
                    <Text style={[
                        styles.modalText
                    ]}>
                        {dia}
                    </Text>
                </TouchableOpacity>
            </View>
        ))}
          </View>

          <View style={{'marginTop':20}}>
            {aparatos.map(cada_aparato => (
              cada_aparato.regleta === info.master ?
                <View key={cada_aparato.id}>
                  <TouchableOpacity 
                    style={[styles.btnAparatos, {backgroundColor: aparatos.some(ap => ap.aparato === cada_aparato.aparato) ? 'green' : 'purple'}]} 
                    onPress={() => toggleAparatos(cada_aparato)}>
                    <Text style={[
                      styles.modalText
                    ]}>
                      {cada_aparato.aparato}
                    </Text>
                  </TouchableOpacity>
                </View>
              : null
            ))}
          </View>

          <TouchableOpacity style={styles.boton} onPress={() => setShowEncendidoPicker(true)}>
              <Text style={styles.botonTexto}>Configurar Encendido</Text>
            </TouchableOpacity>
            {horaEncendidoStr ? <Text style={styles.horaText}>Encendido: {horaEncendidoStr}</Text> : null}
          <TouchableOpacity style={styles.boton} onPress={() => setShowApagadoPicker(true)}>
              <Text style={styles.botonTexto}>Configurar Apagado</Text>
            </TouchableOpacity>
            {horaApagadoStr ? <Text style={styles.horaText}>Apagado: {horaApagadoStr}</Text> : null}
          {/* Botón para cerrar el modal */}

          <TouchableOpacity onPress={guardarRutina} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Guardar rutina</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>

          {showEncendidoPicker && (
        <DateTimePicker value={horaEncendido} mode="time" display="default" onChange={onChangeEncendido} />
      )}
          {showApagadoPicker && (
        <DateTimePicker value={horaApagado} mode="time" display="default" onChange={onChangeApagado} />
      )}
        </View>
      </Modal>
    );
  };

  const styles = StyleSheet.create({
    modalView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: '5%',
      backgroundColor: 'white',
      marginHorizontal: '2.5%',
      borderRadius: 20,
      padding: 35,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginBottom: 15,
      textAlign: 'center',
    },
    closeButton: {
      marginTop:50,
      padding: 10,
      backgroundColor: '#2196F3',
      borderRadius: 5,
    },
    closeButtonText: {
      color: 'white',
      fontSize: 16,
    },
    boton: {
        backgroundColor: '#3897f0',
        padding: 10,
        borderRadius: 20,
        width: '80%',
        alignItems: 'center',
        marginVertical: 10,
      },
      btnDias:{
        backgroundColor: '#3897f0',
        padding: 4,
        borderRadius: 10,
        alignItems: 'center',
      },
      btnAparatos:{
        backgroundColor: 'purple',
        padding: 10,
        borderRadius: 10,
        width: 150,
        alignItems: 'center',
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
      modalInput: {
        borderWidth: 1,
        borderColor: '#CCCCCC',
        borderRadius: 5,
        padding: 5,
        marginBottom: 10,
        //width: '100%',
      },
  });
  

export default Rutinas;
