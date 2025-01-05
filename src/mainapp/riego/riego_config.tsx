import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Platform, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as SecureStore from 'expo-secure-store';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import ip from "../../ips.json";
import { useRoute } from '@react-navigation/native';

const NuevaPantalla = () => {
  const [aparatos, setAparatos] = useState([
    {'name':'bomba de riego'},
    {'name':'calentador agua'},
    {'name':'oxigenador'},
    {'name':'bomba de rellenar'},
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
  const [hayLuz, setHayLuz] = useState(null);
  const [showEncendidoPicker, setShowEncendidoPicker] = useState(false);
  const [showApagadoPicker, setShowApagadoPicker] = useState(false);
  const [ownRisk, setOwnRisk] = useState(false);
  const [senCapSel, setSenCapSel] = useState({});
  const [senCapReSel, setSenCapReSel] = useState({});
  const [senTempSel, setSenTempSel] = useState('');
  const [listCapSen, setListCapSen] = useState([]);
  const [senTempAction, setSenTempAction] = useState(true);
  const [senCapAction, setSenCapAction] = useState(true);
  const [senCapReAction, setSenCapReAction] = useState(true);
  const [litroHora, setLitroHora] = useState('');
  const [tempWater, setTempWater] = useState('');
  const [numPausa, setNumPausa] = useState('');
  const [timePausa, setTimePausa] = useState('');
  const [apaBomba, setApaBomba] = useState('');
  const [apaBombaRellena, setApaBombaRellena] = useState('');
  const [apacalen, setApacalen] = useState('');
  const [apaOxi, setApaOxi] = useState('');
  const [apaVenti, setApaVenti] = useState('');
  const [horaEncendido, setHoraEncendido] = useState(new Date());
  const [horaApagado, setHoraApagado] = useState(new Date());
  // Agregado para visualización
  const aparato_clave = "bomba de riego"
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
            let info
            response.data.info.forEach(element => {
              if (element.info.space === espacioName && aparato.name.toLowerCase() === element.info.aparato.toLowerCase()) {
                existe = true;
                const numChannel = element.info.numChannel
                const regleta = element.info.regleta
                info = {"numChannel":numChannel,"regleta":regleta}

              }
            });
            return { ...aparato, existe, info }; // Devuelve el aparato original con la propiedad "existe" actualizada
          });
          
          setAparatos(updatedAparatos); // Asumiendo que setAparatos es una función de estado para actualizar aparatos
          console.log("todos apa")
          console.log(updatedAparatos);
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };
  function addListSen(item) {
    setListCapSen(prevItems => [...prevItems, item]); // This correctly creates a new array.
   
   } 
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
          response.data.forEach(element => {
            console.log("ostiaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
            console.log(element.info.topic)
            if (element.info.esp_cat === espacioName) {
              console.log("ojooooooo")
              console.log(element.info)
              if (Array.isArray(element.info)) {
                console.log("nomal")
                //setListCapSen(element.info);
                addListSen(element.info)
                //setSenCapSel(element.info['name'])
              } else {
                console.log('rarrrro')
                addListSen(element.info)
                console.log(listCapSen)
                //setListCapSen([element.info]); // Convertir en arreglo si no lo es
                //setSenCapSel([element.info][0]['name'])
              }
            }
          });
          console.log("lol")
          //console.log(listCapSen[0]['name'])
          console.log(updatedSensores);
          setHayLuz(true);
        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
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
          console.log("erroooooor")
          console.log(response.data)
        } else {
          console.log("tiiiiiiiiijajajajajajajaj")
          console.log(response.data[0])
          response.data.forEach(element => {
            if (element.info.space === espacioName){
              console.log("hasta la polla")
              console.log(element.info.senCap)
              setLitroHora(element.info.litroHora)
              setTempWater(element.info.tempWater)
              setNumPausa(element.info.numPausa)
              setTimePausa(element.info.timePausa)
              setSenCapSel(element.info.senCap)
              setSenTempSel(element.info.senTemp)
              setApaBomba(element.info.aparatos.bomba)
              setApaBombaRellena(element.info.aparatos.bombaRellena)
              setApaOxi(element.info.aparatos.oxigenador)
              setApacalen(element.info.aparatos.calentador)
            }
          });

        } 
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };
  const save_riego = async () => {
    // Formatea la hora de encendido y apagado para enviar a tu backend
    console.log("saveit")
    console.log(senCapSel)
    console.log(senCapSel)
    const newLuzConfig = {
      litroHora: litroHora,
      tempWater: tempWater,
      numPausa: numPausa,
      timePausa: timePausa,
      space:espacioName,
      senCap:{'info':senCapSel.info,'state':senCapAction},
      senTemp:{'info':senTempSel.info,'state':senTempAction},
      senRellena:{'info':senCapReSel.info,'state':senCapReAction},
      aparatos:{"bomba":apaBomba,"bombaRellena":apaBombaRellena,"calentador":apacalen,"ventilador":apaVenti,"oxigenador":apaOxi}
    };
    try {
      console.log(newLuzConfig)
      const token = await SecureStore.getItemAsync("token_ez");
      await axios.post(`http://${ip.ips.elegido}/api/pages/set_riego`, newLuzConfig, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      alert('Configuración del riego guardada correctamente');
    } catch (error) {
      console.error('Error al guardar la configuración del riego:', error);
      alert('Error al guardar la configuración del riego');
    }

  };
  useEffect(() => {
    setListCapSen([])
    info_aparatos();
    info_sensores()
    info_riego()
    //setAllSenApa(aparatos.every(ap => ap.existe) && sensores.every(sen => sen.existe))
  }, []);

  const todosConfigurados = aparatos.every(ap => ap.existe) && sensores.every(sen => sen.existe);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {hayLuz === null ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : hayLuz && Object.keys(aparatos).length > 0 ? (
        <>
        <Text style={styles.titulo}>Configuracion de Riego</Text>
        <View style={styles.infoContainer}>

 
          {
            // Verifica si todos los aparatos existen, en caso de TODOS OK VAMOS
            todosConfigurados || ownRisk ? 
            <View>
              <View style={styles.cont_op}>
                <Text style={styles.texto}>Bomba riego: </Text>
                <TextInput
                      style={styles.modalInput}
                      value={litroHora}
                      keyboardType='numeric'
                      onChangeText={(text) => setLitroHora(text)}
                    />
                <Text style={styles.texto}> L/H</Text>
              </View>
              <View style={styles.cont_op}>
                <Text style={styles.texto}>Temperatura de agua:</Text>
                <TextInput
                      style={styles.modalInput}
                      value={tempWater}
                      keyboardType='numeric'
                      onChangeText={(text) => setTempWater(text)}
                    />
                <Text style={styles.texto}> C</Text>
              </View>
              <View style={styles.cont_op}>
                <Text style={styles.texto}>Cantidad de pausas{"("}division{")"}:</Text>
                <TextInput
                      style={styles.modalInput}
                      value={numPausa}
                      keyboardType='numeric'
                      onChangeText={(text) => setNumPausa(text)}
                    />
              </View>
              <View style={styles.cont_op}>
                <Text style={styles.texto}>Tiempo pausa de riego:</Text>
                <TextInput
                      style={styles.modalInput}
                      value={timePausa}
                      keyboardType='numeric'
                      onChangeText={(text) => setTimePausa(text)}
                    />
                    <Text style={styles.texto}> Min</Text>
              </View>
              <View style={styles.cont_sen_cap}>
                <View style={{flexDirection:'row'}}>
                  <Text style={styles.texto}>Sensor de temperatura agua:</Text>
                  <TouchableOpacity style={{borderRadius:10,backgroundColor:senTempAction?"green":"red",paddingHorizontal:10}} onPress={() => setSenTempAction(!senTempAction)}>
                    <Text style={{color:'black',paddingTop:10}}>{senTempAction?"On":"Off"}</Text>
                  </TouchableOpacity>
                </View>
                <Picker
                  style={styles.pickr}
                  selectedValue={senTempSel.info?.topic}
                  onValueChange={(itemLabel, itemValue) => {
                    console.log(itemValue)
                    console.log(itemLabel)
                    console.log({'info':listCapSen[itemValue]})
                    setSenTempSel({'info':listCapSen[itemValue]});
                  }}>
                  {listCapSen.map((tipo, index) => (
                  <Picker.Item
                      key={index}
                      label={tipo.name}  // Ajusta según la estructura real de tus datos
                      value={tipo.topic}  // Ajusta según la estructura real de tus datos
                      style={styles.txt_opsel}
                  />
                  ))}
              </Picker>
              </View>
              <View style={styles.cont_sen_cap}>
                <View style={{flexDirection:'row'}}>
                  <Text style={styles.texto}>Sensor de capacidad riego:</Text>
                  <TouchableOpacity style={{borderRadius:10,backgroundColor:senCapAction?"green":"red",paddingHorizontal:10}} onPress={() => setSenCapAction(!senCapAction)}>
                    <Text style={{color:'black',paddingTop:10}}>{senCapAction?"On":"Off"}</Text>
                  </TouchableOpacity>
                </View>
                
                <Picker
                  style={styles.pickr}
                  selectedValue={senCapSel.info?.name}
                  onValueChange={(itemLabel, itemValue) => {
                    console.log(itemValue)
                    console.log(itemLabel)
                    console.log(listCapSen)
                    console.log({'info':listCapSen[itemValue]})
                    setSenCapSel({'info':listCapSen[itemValue]});
                  }}>
                  {listCapSen.map((tipo, index) => (
                  <Picker.Item
                      key={index}
                      label={tipo.name}  // Ajusta según la estructura real de tus datos
                      value={tipo.name}  // Ajusta según la estructura real de tus datos
                      style={styles.txt_opsel}
                  />
                  ))}
                </Picker>
              </View>
              <View style={styles.cont_sen_cap}>
                <View style={{flexDirection:'row'}}>
                  <Text style={styles.texto}>Sensor de capacidad rellena:</Text>
                  <TouchableOpacity style={{borderRadius:10,backgroundColor:senCapAction?"green":"red",paddingHorizontal:10}} onPress={() => setSenCapReAction(!senCapReAction)}>
                    <Text style={{color:'black',paddingTop:10}}>{senCapAction?"On":"Off"}</Text>
                  </TouchableOpacity>
                </View>
                
                <Picker
                  style={styles.pickr}
                  selectedValue={senCapReSel.info?.name}
                  onValueChange={(itemLabel, itemValue) => {
                    console.log(itemValue)
                    console.log(itemLabel)
                    //console.log(listCapSen)
                    console.log({'info':listCapSen[itemValue]})
                    setSenCapReSel({'info':listCapSen[itemValue]});
                  }}>
                  {listCapSen.map((tipo, index) => (
                  <Picker.Item
                      key={index}
                      label={tipo.name}  // Ajusta según la estructura real de tus datos
                      value={tipo.name}  // Ajusta según la estructura real de tus datos
                      style={styles.txt_opsel}
                  />
                  ))}
                </Picker>
              </View>
              {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  aparatos.map((ap, index) => (
                    ap.name.toLocaleLowerCase() === "bomba de riego" ? 
                    <View style={styles.cont_sen_cap}>
                    <Text style={styles.texto}>Bomba de riego:</Text>
                    <Picker
                      style={styles.pickr}
                      selectedValue={apaBomba}
                      onValueChange={(itemValue, itemLabel) => {
                        console.log(itemValue)
                        setApaBomba(itemValue);
                      }}>
                      {aparatos.map((tipo, index) => (
                      <Picker.Item
                          key={index}
                          label={tipo.name}  // Ajusta según la estructura real de tus datos
                          value={tipo.name}  // Ajusta según la estructura real de tus datos
                          style={styles.txt_opsel}
                      />
                      ))}
                  </Picker>
                  </View>
                  :
                  null
                  ))
                }
                              {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  aparatos.map((ap, index) => (
                    ap.name.toLocaleLowerCase() === "bomba de rellenar" ? 
                    <View style={styles.cont_sen_cap}>
                    <Text style={styles.texto}>Bomba/Valvula de rellenar:</Text>
                    <Picker
                      style={styles.pickr}
                      selectedValue={apaBombaRellena}
                      onValueChange={(itemValue, itemLabel) => {
                        console.log(itemValue)
                        setApaBombaRellena(itemValue);
                      }}>
                      {aparatos.map((tipo, index) => (
                      <Picker.Item
                          key={index}
                          label={tipo.name}  // Ajusta según la estructura real de tus datos
                          value={tipo.name}  // Ajusta según la estructura real de tus datos
                          style={styles.txt_opsel}
                      />
                      ))}
                  </Picker>
                  </View>
                  :
                  null
                  ))
                }
              {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  aparatos.map((ap, index) => (
                    ap.name.toLocaleLowerCase() === "calentador agua" ? 
                    <View style={styles.cont_sen_cap}>
                    <Text style={styles.texto}>Calentador de agua:</Text>
                    <Picker
                      style={styles.pickr}
                      selectedValue={apacalen}
                      onValueChange={(itemValue, itemLabel) => {
                        console.log(itemValue)
                        setApacalen(itemValue);
                      }}>
                      {aparatos.map((tipo, index) => (
                      <Picker.Item
                          key={index}
                          label={tipo.name}  // Ajusta según la estructura real de tus datos
                          value={tipo.name}  // Ajusta según la estructura real de tus datos
                          style={styles.txt_opsel}
                      />
                      ))}
                  </Picker>
                  </View>
                  :
                  null
                  ))
                }
              {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  aparatos.map((ap, index) => (
                    ap.name.toLocaleLowerCase() === "oxigenador" ? 
                    <View style={styles.cont_sen_cap}>
                    <Text style={styles.texto}>Oxigenador:</Text>
                    <Picker
                      style={styles.pickr}
                      selectedValue={apaOxi}
                      onValueChange={(itemValue, itemLabel) => {
                        console.log(itemValue)
                        setApaOxi(itemValue);
                      }}>
                      {aparatos.map((tipo, index) => (
                      <Picker.Item
                          key={index}
                          label={tipo.name}  // Ajusta según la estructura real de tus datos
                          value={tipo.name}  // Ajusta según la estructura real de tus datos
                          style={styles.txt_opsel}
                      />
                      ))}
                  </Picker>
                  </View>
                  :
                  null
                  ))
                }
              {
                  // Mapeo de todos los aparatos para mostrar su estado de existencia
                  aparatos.map((ap, index) => (
                    ap.name.toLocaleLowerCase() === "ventilador agua" ? 
                    <View style={styles.cont_sen_cap}>
                    <Text style={styles.texto}>Ventilador de agua:</Text>
                    <Picker
                      style={styles.pickr}
                      selectedValue={apaVenti}
                      onValueChange={(itemValue, itemLabel) => {
                        console.log(itemValue)
                        setApaVenti(itemValue);
                      }}>
                      {aparatos.map((tipo, index) => (
                      <Picker.Item
                          key={index}
                          label={tipo.name}  // Ajusta según la estructura real de tus datos
                          value={tipo.name}  // Ajusta según la estructura real de tus datos
                          style={styles.txt_opsel}
                      />
                      ))}
                  </Picker>
                  </View>
                  :
                  null
                  ))
                }



              <Button title="Guardar" onPress={() => save_riego()} />
            </View>

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
  cont_op:{
    flexDirection:'row',
  },
  cont_sen_cap:{
    flexDirection:'column',
    width:"100%",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 4,
    marginBottom: 5,
    //width: '100%',
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickr:{
    marginTop:-15,
    width:200,
  },
  txt_opsel:{
    color: '#000000', // Color del texto del botón (puedes cambiarlo)
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:"center",
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