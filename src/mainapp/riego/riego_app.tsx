import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import CheckBox from '@react-native-community/checkbox'
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ip from "../../ips.json";
import { useRoute } from '@react-navigation/native';
import { sendNotification, requestPermissions } from "../usePushNotifications";

const NuevaPantalla = () => {
  const [hayLuz, setHayLuz] = useState(null);
  const [aparatos, setAparatos] = useState([
    {'name':'bomba de riego'},
    {'name':'calentador agua'},
    //{'name':'oxigenador'},
    //{'name':'ventilador de agua'},
    //{'name':'desague'},
  ]);
  const [sensores, setSensores] = useState([
    {'topic':'sen_water_temp','name':'Sensor temp agua'},
    {'topic':'sen_water_dist','name':'Sensor cantidad agua'}
  ]);
  const [extraInfo,setExtraInfo] = [
    {'name':'fertilizantes?'},
    {'name':'cantidad de riego?'},
    {'name':'pausado? rapido?'},
  ]
  const [isSelected, setSelection] = useState(false);
  const [litroHora, setLitroHora] = useState('');
  const [tempWater, setTempWater] = useState('');
  const [isSenBidon, setIsSenBidon] = useState(false);
  const [ownRisk, setOwnRisk] = useState(false);
  const [numPausa, setNumPausa] = useState('');
  const [timePausa, setTimePausa] = useState('');
  const [cantidadRiego, setCantidadRiego] = useState('');
  const [hayConfig, setHayConfig] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [infoBidones, setInfoBidones] = useState({});
  const [likidoTotal, setLikidoTotal] = useState('');
  const [showHoraRiegoPicker, setShowHoraRiegoPicker] = useState(false);
  const [horaRiego, setHoraRiego] = useState(new Date());
  // Agregado para visualización
  const [horaRiegoStr, setHoraRiegoStr] = useState('');
  // Agregado para visualización
  const aparato_clave = "riego"
  const route = useRoute();
  const { espacioName } = route.params;
  //console.log(espacioName);

  const info_aparatos = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = {'space':espacioName}
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_aparatos`,{fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
  
      if (response.status === 200) {
        if (response.data['Error']) {
          setHayLuz(false);
        } else {
          console.log(response.data);
          
          const updatedAparatos = aparatos.map(aparato => {
            let existe = false;
            response.data.info.forEach(element => {
              if (element.info.space === espacioName && aparato.name.toLowerCase() === element.info.aparato.toLowerCase()) {
                existe = true;
              }
            });
            return { ...aparato, existe }; // Devuelve el aparato original con la propiedad "existe" actualizada
          });
  
          setAparatos(updatedAparatos); // Asumiendo que setAparatos es una función de estado para actualizar aparatos
          console.log(updatedAparatos);
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  const info_capacidad = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      //aqui identificar con nombre para usar el correcto, debi guardarlo en config del bidon, crear select para seleccionar el sensor q usa.
      const fin = {'space':espacioName,'reg':8}
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/now_info_capacidad`, {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("erroooooor1")
          console.log(response.data)
          setCargando(false);
          setHayLuz(false);
          //setHayConfig(false)
        } else {
          console.log("tiiiiiiiiijajajajajajajaj 1")
          console.log(response.data.distancia)
          if (response.data.space === espacioName){
            console.log(response.data.distancia)
            console.log(infoBidones)
              if (infoBidones.distVacio !== undefined && infoBidones.tipo === "riego") {
                const ahora = response.data.distancia
                const total = infoBidones.distVacio
                const Lespacio = total - infoBidones.dist1L
                const ahoraEspacio = total - ahora
                const finito = ahoraEspacio / Lespacio
                console.log(total)
                console.log(ahoraEspacio)
                console.log(finito)
                if (String(finito) !== "NaN") {
                  console.log("JOOOOOOOOOOOOOOOODERRRRRRRRRRRRRRRRR")
                  setLikidoTotal(String(finito.toFixed(2)))
                  setCargando(false);
                }
              }              
            
          }

        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  const info_bidones = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = {'space':espacioName}
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_bidones`, {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("erroooooor2")
          console.log(response.data)
          setCargando(false);
          setIsSenBidon(false)
        } else {
          console.log("3333333333333333333333333333333")
          console.log(response.data)
          response.data.forEach(element => {
            console.log(element.info)
            if (element.info.space === espacioName){
              console.log(element.info)
              console.log(aparatos)
              setInfoBidones(element.info)
              setIsSenBidon(true)
              
            }else{
              setIsSenBidon(false)
            }
          });
          
        }
        //setCargando(false)
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setIsSenBidon(false);
      setCargando(false);
    }
  };
  const info_riego = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = {'space':espacioName}
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_riego`, {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("erroooooor3")
          console.log(response.data)
          setHayConfig(false)
          setCargando(false)
        } else {
          console.log("tiiiiiiiiijajajajajajajaj 2")
          console.log(response.data)
          response.data.forEach(element => {
            if (element.info.space === espacioName){
              setLitroHora(element.info.litroHora)
              setTempWater(element.info.tempWater)
              setNumPausa(element.info.numPausa)
              setTimePausa(element.info.timePausa)
              setHayConfig(true)
              
            }
          });
          
        } 
        
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setCargando(true)
      setHayLuz(false);
    }
  };
  
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
          setHayLuz(false);
          setCargando(false);
          
        } else {
          console.log("joder que caos")
          console.log(response.data)
          const updatedSensores = sensores.map(sensor => {
            let existe = false;
            response.data.forEach(element => {
              if (element.info.esp_cat === espacioName && sensor.topic.toLowerCase() === element.info.topic.toLowerCase()) {
                existe = true;
              }
            });
            return { ...sensor, existe }; // Devuelve el aparato original con la propiedad "existe" actualizada
          });
          setSensores(updatedSensores); // Asumiendo que setAparatos es una función de estado para actualizar aparatos
          console.log("lol")
          console.log(updatedSensores);
          setHayLuz(true);
          //setCargando(false);
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };


  const handleCheck = () => {
    setSelection(!isSelected);
  };

  const lanzaRiego = async () => {
    const fertis = isSelected ? "fertis" : "noFertis"
    //if (litroHora && tempWater && likidoTotal && cantidadRiego && horaRiegoStr && fertis) {
    if (litroHora && cantidadRiego && horaRiegoStr && fertis) {
      console.log("datos:")
      console.log(litroHora)
      console.log(tempWater)
      console.log(likidoTotal)
      console.log(cantidadRiego)
      console.log(horaRiegoStr)
      console.log(isSelected)
      try {
        const token = await SecureStore.getItemAsync("token_ez");
        const fin = {'info_riego':{"hardBypass":ownRisk,"litroHora":litroHora,"tempWater":tempWater,'likidoTotal':likidoTotal,'cantidadRiego':cantidadRiego,'horaRiegoStr':horaRiegoStr,'fertis':fertis,'space':espacioName}}
        const response = await axios.post(`http://${ip.ips.elegido}/api/pages/lanzar_riego`,{fin},{
          headers: {
            'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
          }
        });
    
        if (response.status === 200) {
          if (response.data['Error']) {
            alert("Error al recibir los datos")
          } else {
            alert("Riego configurado correctamente!")
          } 
        }
      } catch (error) {
        console.error('Error al verificar el token:', error);
        alert("Error al enviar los datos")
      }
    }else{
      alert("Completa todas las opciones!")
    }

  };
  

  useEffect(() => {
    setHoraRiegoStr('')
    setCantidadRiego('')
    setSelection(false)
    info_aparatos();
    //setAllSenApa(aparatos.every(ap => ap.existe) && sensores.every(sen => sen.existe))
  }, []);

  useEffect(() => {
    if (aparatos.length > 0) {
      info_sensores()
    }
  }, [aparatos]);
  useEffect(() => {
    if (sensores.length > 0) {
      info_riego()
    }
  }, [sensores]);
  useEffect(() => {
    if (hayConfig) {
      info_bidones()
    }
  }, [hayConfig]);
  useEffect(() => {
    if (Object.keys(infoBidones).length > 0) {
      info_capacidad()
    }
  }, [infoBidones]);

  const onChangeHoraRiego = (event, selectedDate) => {
    setShowHoraRiegoPicker(Platform.OS === 'ios');

    if (selectedDate) {
      const selectedHours = selectedDate.getHours();
      const selectedMinutes = selectedDate.getMinutes();
      const restrictedStart = new Date(selectedDate);
      restrictedStart.setHours(18, 30, 0, 0);
      const restrictedEnd = new Date(selectedDate);
      restrictedEnd.setHours(19, 20, 0, 0);

      if (selectedDate >= restrictedStart && selectedDate <= restrictedEnd) {
        alert('El horario entre las 18:30 y las 19:20 no está disponible debido al reinicio del servidor.');
      } else {
        setHoraRiego(selectedDate);
        setHoraRiegoStr(selectedDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
      }
    }
  };
  const todosConfigurados = aparatos.every(ap => ap.existe) && sensores.every(sen => sen.existe);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {cargando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : hayLuz && Object.keys(aparatos).length > 0 ? (
        <>
        <Text style={styles.titulo}>Lanzar Riego</Text>
        <View style={styles.infoContainer}>

          {
            // Verifica si todos los aparatos existen, en caso de TODOS OK VAMOS
            todosConfigurados || ownRisk? 
              hayConfig ?
                isSenBidon || ownRisk? 
                  <View style={styles.cont_all}>
                    <View style={styles.cont_text_info}>
                      <Text style={styles.texto_info}>Bomba: {litroHora} L/H</Text>
                      <Text style={styles.texto_info}>Temp Agua: {tempWater} C</Text>
                      <Text style={styles.texto_info}>Cantidad de agua en bidon:{likidoTotal} L</Text>
                    </View>

                    <View style={styles.cont_cant_riego}>
                      <Text style={styles.texto}>Cantidad para regar </Text>
                        <TextInput
                            style={styles.modalInput}
                            value={cantidadRiego}
                            keyboardType='numeric'
                            onChangeText={(text) => setCantidadRiego(text)}
                          />
                      <Text style={styles.texto}>  Litros</Text>
                    </View>
                    <View style={styles.cont_time_riego}>
                      
                      <TouchableOpacity style={styles.boton} onPress={() => setShowHoraRiegoPicker(true)}>
                        <Text style={styles.botonTexto}>Hora riego</Text>
                      </TouchableOpacity>

                      <Text style={styles.texto}> {horaRiegoStr}</Text>
                    </View>
                    <View style={styles.cont_cant_riego}>
                      <Text style={styles.texto}> Riego Con Fertilizantes: </Text>
                      <TouchableOpacity style={styles.checkboxContainer} onPress={handleCheck}>
                        <Text style={styles.texto_opciones}>{isSelected? " Si " : " No "}</Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <TouchableOpacity style={styles.checkboxContainer} onPress={lanzaRiego}>
                        <Text style={styles.texto_opciones}>Lanzar Riego!</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                :(
                  <View>
                    <Text style={styles.texto}>Por favor configura el sensor de capacidad del bidon.</Text>
                  </View>
                )
              : (
                <View>
                <Text style={styles.texto}>Por favor configura previamente el riego.</Text>
              </View>
              )

            : 
            (
              <View>
                <View>
                {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  aparatos.map((ap, index) => (
                    <Text style={[styles.texto, { color: ap.existe ? "green" : "red" }]} key={index}>
                      {ap.name} {ap.existe ? "configurado!" : "no está configurado."}
                    </Text>
                  ))
                }
                </View>
                <View>
                {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  sensores.map((sen, index) => (
                    <Text style={[styles.texto, { color: sen.existe ? "green" : "red" }]} key={index}>
                      {sen.name} {sen.existe ? "configurado!" : "no está configurado."}
                    </Text>
                  ))
                }
                  <View style={{flexWrap:'wrap',alignContent:'center',alignItems:'center'}}>
                    <TouchableOpacity style={{padding:10,backgroundColor:'red', borderRadius:7}} onPress={() => setOwnRisk(true)}>
                        <Text>Continuar(peligro)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )
          }
        </View>
      </>
      ) : (
        <View>
          <Text style={styles.texto}>Oops.</Text>
          <Text style={styles.texto}>{Object.keys(aparatos).length > 0 ? "" : "Debes configurar el enchufe de la lampara."}</Text>
        </View>
      )}

      {showHoraRiegoPicker && (
        <DateTimePicker value={horaRiego} mode="time" display="default" onChange={onChangeHoraRiego} />
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
  cont_all:{
    flexDirection:"column",
    justifyContent: 'center',
    alignItems: 'center',
    //backgroundColor: '#f0f0f5',

    width:'100%',
  },
  texto_opciones:{
    backgroundColor: '#3897f0',
    borderRadius:3,
    padding:4,
    fontSize:18,
  },
  checked: {
    backgroundColor: 'red',
  },
  checkboxContainer: {
    margin:8,
    flexDirection: 'row',
    //marginBottom: 20,
    flexWrap:"wrap",
  },
  checkbox: {
    alignSelf: 'center',
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
  texto_info:{
    fontSize: 16,
    marginVertical: 10,
    backgroundColor:"orange",
    borderRadius:5,
    marginLeft:5,
  },
  cont_text_info:{
    flexDirection:"row",
    flexWrap:"wrap",
  },
  cont_cant_riego:{
    flexDirection:"row",
    flexWrap:"wrap",
  },
  cont_time_riego:{
    flexDirection:"row",
    flexWrap:"wrap",
    margin:10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 4,
    marginBottom: 5,
    //width: '100%',
  },
  texto: {
    fontSize: 16,
    marginVertical: 10,
  },
  boton: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 20,
    width: '40%',
    alignItems: 'center',
    //marginVertical: 10,
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