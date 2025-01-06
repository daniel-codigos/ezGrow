import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import ip from "../../ips.json";
import { sendNotification, requestPermissions } from "../usePushNotifications";

const NuevaPantalla = () => {
  const [hayLuz, setHayLuz] = useState(null);
  const [aparatos, setAparatos] = useState([
    { 'name': 'bomba de riego', 'tipo':'riego' },
    { 'name': 'calentador agua', 'tipo':'riego' },
    { 'name': 'bomba de rellenar', 'tipo':'rellena' },
    { 'name': 'Válvula Relleno', 'tipo':'autorellena' },
  ]);
  const [sensores, setSensores] = useState([]);
  const [extraInfo, setExtraInfo] = useState([
    { 'name': 'fertilizantes?' },
    { 'name': 'cantidad de riego?' },
    { 'name': 'pausado? rapido?' },
  ]);
  const [numLitros, setNumLitros] = useState('');
  const [likidoTotal, setLikidoTotal] = useState('');
  const [likidoTotalRelleno, setLikidoTotalRelleno] = useState('');
  const [distVacio, setDistVacio] = useState('');
  const [dist1L, setDist1L] = useState('');
  const [hayConfig, setHayConfig] = useState(null);
  const [senCapRiego, setSenCapriego] = useState([]);
  const [senCapRellena, setSenCapRellena] = useState([]);
  const [infoBidones, setInfoBidones] = useState([]);
  const [infoBidonesActualizado, setInfoBidonesActualizado] = useState(false);
  const [primerPaso, setPrimerPaso] = useState(false);
  const [segundoPaso, setsegundoPaso] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [distVacioRiego, setDistVacioRiego] = useState('');
  const [dist1LRiego, setDist1LRiego] = useState('');
  const [distVacioRellena, setDistVacioRellena] = useState('');
  const [dist1LRellena, setDist1LRellena] = useState('');
  const [noConfig, setNoConfig] = useState([]);
  const [configRellenos, setConfigRellenos] = useState([]);
  const [horaRiegoStr, setHoraRiegoStr] = useState('');
  const [autorellenoLitro, setAutorellenoLitro] = useState('');
  const [autorellenoMin, setAutorellenoMin] = useState('');
  const [ownRisk, setOwnRisk] = useState(false);
  const aparato_clave = "riego";
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;

  const quitarTildes = (texto) => {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const info_bidones = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_bidones`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("Error al obtener información de bidones");
          setCargando(false);
          setHayConfig(false);
          setHayLuz(true);
        } else {
          console.log("el repsonse mono:")
          console.log(response.data)
          console.log("aparatos:")
          console.log(aparatos)
          response.data.forEach(element => {
            if (element.info.space === espacioName) {
              console.log('bidones AQIII brooo');
              console.log(element.info);
              setInfoBidones(prevInfoBidones => [...prevInfoBidones, element.info]);
              setAparatos((prevAparatos) =>
                prevAparatos.map((cada_aparato) => {
                  // Comparar si el tipo del aparato coincide con el tipo del response
                  if (cada_aparato.tipo === element.info.tipo) {
                    return { ...cada_aparato, status: true }; // Coincidencia
                  }
                  return { ...cada_aparato, status: cada_aparato.status ?? false }; // Sin coincidencia, mantener estado o false
                })
              );
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };
  useEffect(() => {
    if (infoBidonesActualizado) {
      if (infoBidones.length > 0) {
        //info_capacidad(8);

        setHayConfig(true);
        setHayLuz(true);
      } else {
        console.log("No hay configuración de sensor de riego.");
      }
      setInfoBidonesActualizado(false);
    }
  }, [infoBidones, infoBidonesActualizado]);

  const info_aparatos = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_aparatos`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setHayLuz(false);
        } else {
            console.log("response:")
            console.log(response.data.info)
            console.log("aparatos;:")
            console.log(aparatos)
          const updatedAparatos = aparatos.map(aparato => {
            let existe = false;
            response.data.info.forEach(element => {

              if (element.info.space === espacioName && quitarTildes(aparato.name.toLowerCase()) === quitarTildes(element.info.aparato.toLowerCase())) {
                //console.log("1")
                //console.log(element.info)
                //console.log(espacioName)
                //console.log("2")
                //console.log(quitarTildes(aparato.name.toLowerCase()))
                //console.log(quitarTildes(element.info.aparato.toLowerCase()))
                //console.log("entroo")
                existe = true;
              }
            });
            return { ...aparato, existe };
          });
          setAparatos(updatedAparatos);
          console.log('updatedddd')
          console.log(updatedAparatos)
          setCargando(false)
          info_bidones()
          //meter aqui pa seguir
          //info_riego();
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  const info_riego = async () => {
    /* sacamos */
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/info_riego`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setHayConfig(false);
        } else {
          response.data.forEach(element => {
            if (element.info.space === espacioName) {
              console.log('colooooo');
              console.log(element.info.senCap.info);
              setSenCapriego([element.info.senCap.info]);
              setSenCapRellena([element.info.senRellena.info]);
              if ([element.info].length > 0) {
                info_sensores([element.info.senCap.info, element.info.senTemp.info]);
              } else {
                console.log("No hay configuración de sensor de riego.");
              }
            }
          });
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  
  const set_bidones = async (tipo) => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName, "distVacio": distVacio, "dist1L": dist1L, "nameSen": sensores[0]?.sen, "tipo": tipo };
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/set_bidones`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("Error al configurar bidones");
        } else {
          console.log("Configuración de bidones exitosa");
        }
        setDist1L('');
        setDistVacio('');
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

 
  const info_rellena = async (info) => {
    try {
      setCargando(true);
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName, 'reg': 8, 'info': info[0] };
      console.log("enviamos");
      console.log(info);
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/now_info_sensor`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
  
      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("erroooooor1");
          setCargando(false);
        } else {
          if (response.data.space === espacioName) {
            infoBidones.forEach(cadaBidon => {
              if (cadaBidon.tipo === 'rellena') {
                const valores = response.data;
                console.log("ojo cuidao brooo rellena");
                console.log(valores);
                console.log(cadaBidon);
                const ahora = response.data.distancia;
                const total = cadaBidon.distVacio;
                const Lespacio = total - cadaBidon.dist1L;
                const ahoraEspacio = total - ahora;
                const finito = (ahoraEspacio / Lespacio) * 2;
                console.log(finito);
                if (!isNaN(finito)) {
                  setLikidoTotalRelleno(finito.toFixed(2));
                  setCargando(false);
                }
              }
            });
          }
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
    }
  };


  const info_sensores = async (senCapRiego) => {
    try {
      const token = await SecureStore.getItemAsync("token_ez");
      const fin = { 'space': espacioName };
      const response = await axios.post(`http://${ip.ips.elegido}/api/info_sensores/take_info`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          setHayLuz(false);
        } else {
          const updatedSensores = senCapRiego.map(sensor => {
            let existe = false;
            response.data.forEach(element => {
              console.log("fijate melon");
              console.log(element.info);
              console.log(sensor);
              if (element.info && element.info.esp_cat === espacioName && sensor && sensor.topic.toLowerCase() === element.info.topic.toLowerCase() && sensor.name.toLowerCase() === element.info.name.toLowerCase()) {
                existe = true;
              }
              if (element.info && element.info.esp_cat === espacioName && sensor.senTemp && sensor.topic.toLowerCase() === element.info.topic.toLowerCase() && sensor.name.toLowerCase() === element.info.name.toLowerCase()) {
                existe = true;
              }
            });
            return { ...sensor, existe };
          });
          console.log('sensores');
          console.log(updatedSensores);
          setSensores(updatedSensores);
          setHayLuz(true);
          info_bidones();
        }
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
  };

  const saveConfig = async (e) => {
    if (e === "autorellena") {
      console.log(configRellenos)
      let autoL = ""
      let automin = ""
      configRellenos.forEach(cada_relleno => {
        if (cada_relleno.cual === "autorellena"){
          if (cada_relleno.tipo === "litros"){
            autoL = cada_relleno.cantidad
          }else{
            automin = cada_relleno.cantidad
          }
        }
      });

      const fin = {"space":espacioName,"litros":autoL,"minutos":automin,"tipo":e}
      console.log(fin)
      const token = await SecureStore.getItemAsync("token_ez");
      //const fin = { 'space': espacioName, "distVacio": distVacio, "dist1L": dist1L, "nameSen": sensores[0]?.sen, "tipo": tipo };
      try {
      const response = await axios.post(`http://${ip.ips.elegido}/api/pages/set_bidones`, { fin }, {
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });

      if (response.status === 200) {
        if (response.data['Error']) {
          console.log("Error al configurar bidones");
        } else {
          console.log("Configuración de bidones exitosa");
        }
        setDist1L('');
        setDistVacio('');
      }
    } catch (error) {
      console.error('Error al verificar el token:', error);
      setHayLuz(false);
    }
    }
  }

  const handleNotification = () => {
    sendNotification('Relleno completado', '¡Listo! El bidón se ha rellenado correctamente.');
  };

  useEffect(() => {
    if (dist1L.length > 0) {
      if (distVacio.length > 0) {
        set_bidones();
      }
    }
  }, [dist1L]);

  useEffect(() => {
    console.log("k diseeee aqui vamos con el fallo")
    requestPermissions();
    setHoraRiegoStr('');
    setDist1L('');
    setNoConfig([])
    setDistVacio('');
    info_aparatos();
    setInfoBidones([])
  }, []);

  const todosConfigurados = aparatos.every(ap => ap.existe) && sensores.every(sen => sen.existe) && infoBidones.length == aparatos.length;

  return (
    <View style={styles.container}>
      {cargando ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : Object.keys(aparatos).length > 0 ? (
        <>
          <Text style={styles.titulo}>Capacidad Bidones Riego</Text>
          <TouchableOpacity onPress={handleNotification}>
            <Text>Test notify</Text>
          </TouchableOpacity>
          <View style={styles.infoContainer}>
            {todosConfigurados || ownRisk ? (
              hayConfig ? (
                <View>
                  <View style={styles.cont_text_info}>
                    <Text style={styles.texto}>Config edit distancias bidones sensores, tiempo relleno bomba y tiempo relleno grifo</Text>
                    {infoBidones.map((cada_bidon) => (
                      <View>
                        <Text style={{fontSize:18,fontWeight:"bold"}}>{cada_bidon.tipo}</Text>
                        <Text>Distancia (cm) bidon vacio:</Text>
                        <TextInput
                              key={cada_bidon.tipo+"2"}
                              style={styles.modalInput}
                              value={cada_bidon.distVacio}
                              keyboardType='numeric'
                              onChangeText={(text) => setConfigRellenos({"cantidad":num,"tipo":"vacio","cual":cada_aparato.tipo})}
                        />
                        <Text>Distancia (cm) con 1 Litro de agua:</Text>
                        <TextInput
                              key={cada_bidon.tipo+"1"}
                              style={styles.modalInput}
                              value={cada_bidon.dist1L}
                              keyboardType='numeric'
                              onChangeText={(text) => setConfigRellenos({"cantidad":num,"tipo":"1l","cual":cada_aparato.tipo})}
                        />
                      </View>
                    ))}
                    {aparatos.map((cada_aparato) => ( 
                      cada_aparato.tipo === "autorellena" ? 
                      <View>
                        <Text style={{fontSize:18,fontWeight:"bold"}}>{cada_aparato.tipo}</Text>
                        <Text>Cantidad de L / Minutos</Text>
                        <View style={{flexDirection:'row'}}>
                          <TextInput
                                //key={c}
                                style={styles.modalInput}
                                //value={cada_bidon.dist1L}
                                keyboardType='numeric'
                                onChangeText={(num) => setConfigRellenos((todo) => [...todo, { cantidad: 10, tipo: "minutos", cual: "riego" }])}

                          />
                          <Text style={{marginTop:6}}>L /</Text>
                          <TextInput
                                //key={c}
                                style={styles.modalInput}
                                //value={cada_bidon.dist1L}
                                keyboardType='numeric'
                                onChangeText={(num) => setConfigRellenos((todo) => [...todo, { cantidad: 10, tipo: "minutos", cual: "riego" }])}
                              
                          />
                          <Text style={{marginTop:6}}>Minutos</Text>
                        </View>
                      </View>

                      :
                      null
                     ))}

                  </View>
                  <View>
                        <TouchableOpacity style={styles.botonsave} onPress={() => saveConfig()}>
                          <Text style={styles.botonTexto}>Guardar</Text>
                        </TouchableOpacity>
                      </View>
                </View>
              ) : (
                <View>
                {noConfig && (
                  <View>
                    <View>
                      <Text style={styles.texto}>Configuración sensor bidones:</Text>
                    </View>
                    <View style={styles.cont_boton}>
                      {(() => {
                        console.log("Contenido de noConfig:", noConfig);
              
                        if (noConfig.includes("riego")) {
                          // Mostrar el paso para "riego"
                          return (
                            <View>
                              <Text style={styles.texto}>
                                Con el bidón vacío de agua, coloca el sensor en la tapa y dale a listo
                              </Text>
                              <Text style={styles.texto}>{distVacio}</Text>
                              <TouchableOpacity style={styles.boton} onPress={() => info_capacidad(1)}>
                                <Text style={styles.botonTexto}>Listo!</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } if (noConfig.includes("rellena")) {
                          // Mostrar el paso para "rellena"
                          return (
                            <View>
                              <Text style={styles.texto}>
                                Perfecto! Ahora rellene con 1 Litro de agua el bidón y con el sensor en la tapa dele a listo.
                              </Text>
                              <Text style={styles.texto}>{dist1L}</Text>
                              <TouchableOpacity style={styles.boton} onPress={() => info_capacidad(2)}>
                                <Text style={styles.botonTexto}>Listo!</Text>
                              </TouchableOpacity>
                            </View>
                          );
                        } if (noConfig.includes("autorellena")) {
                          // Mostrar el paso para "autorellena"
                          return (
                            <View>
                              <Text style={styles.texto}>Configuracion de AutoRelleno!</Text>
                              <View>
                                <Text>Cantidad de L / Minutos</Text>
                                <View style={{ flexDirection: 'row' }}>
                                  <TextInput
                                    style={styles.modalInput}
                                    keyboardType="numeric"
                                    onChangeText={(num) =>
                                      setConfigRellenos((prevConfigRellenos) => [
                                        ...prevConfigRellenos.filter((item) => item.tipo !== "litros"), // Elimina configuraciones previas de "litros"
                                        { cantidad: num, tipo: "litros", cual: "autorellena" },
                                      ])
                                    }
                                  />
                                  <Text style={{ marginTop: 6 }}>L /</Text>
                                  <TextInput
                                    style={styles.modalInput}
                                    keyboardType="numeric"
                                    onChangeText={(num) =>
                                      setConfigRellenos((prevConfigRellenos) => [
                                        ...prevConfigRellenos.filter((item) => item.tipo !== "minutos"), // Elimina configuraciones previas de "minutos"
                                        { cantidad: num, tipo: "minutos", cual: "autorellena" },
                                      ])
                                    }
                                  />
                                  <Text style={{ marginTop: 6 }}>Minutos</Text>
                                </View>
                                <TouchableOpacity style={styles.botonsave} onPress={() => saveConfig("autorellena")}>
                                  <Text style={styles.botonTexto}>Guardar</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                          
                        }
                      })()}
                    </View>
                  </View>
                )}
              </View>
              
              )
            ) : (
              <View>
                <View>
                  {aparatos.map((ap, index) => (
                    <Text style={[styles.texto, { color: ap.existe && ap.status ? "green" : "red" }]} key={index}>
                      {ap.name} {ap.existe && ap.status ? "configurado!" : "aparato no está configurado."}
                    </Text>
                  ))}
                </View>
                <View>
                  {sensores.map((sen, index) => (
                    <Text style={[styles.texto, { color: sen.existe ? "green" : "red" }]} key={index}>
                      {sen.name} {sen.existe ? "configurado!" : "sensor no está configurado."}
                    </Text>
                  ))}
                  <View style={{ flexWrap: 'wrap', alignContent: 'center', alignItems: 'center',flexDirection:'row' }}>
                    <TouchableOpacity style={{ padding: 10, backgroundColor: 'red', borderRadius: 7 }} onPress={() => {setOwnRisk(true);setHayConfig(true)}}>
                      <Text>Continuar (peligro)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        marginLeft: 5,
                        padding: 10,
                        backgroundColor: 'green',
                        borderRadius: 7,
                      }}
                      onPress={() => {
                        setOwnRisk(true);

                        aparatos.forEach((cada_aparato) => {
                          if (!cada_aparato.status) {
                            console.log("wasaaaaaaaaaa");
                            console.log(cada_aparato.name);
                            console.log(cada_aparato);
                            console.log(cada_aparato.status);

                            // Agregar `cada_aparato.tipo` al estado de `noConfig`
                            setNoConfig((prevNoConfig) => [...prevNoConfig, cada_aparato.tipo]);
                          }
                        });
                      }}
                    >
                      <Text>Configurar</Text>
                    </TouchableOpacity>

                  </View>
                </View>
              </View>
            )}
          </View>
        </>
      ) : (
        <View>
          <Text style={styles.texto}>Oops.</Text>
          <Text style={styles.texto}>{Object.keys(aparatos).length > 0 ? "" : "Debes configurar el enchufe de la lámpara."}</Text>
        </View>
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
  texto_info: {
    fontSize: 16,
    marginVertical: 10,
    backgroundColor: "orange",
    borderRadius: 5,
    marginLeft: 5,
  },
  cont_text_info: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cont_cant_riego: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cont_boton: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 4,
    marginBottom: 5,
    width:25,
  },
  texto: {
    fontSize: 16,
    marginVertical: 10,
  },
  botonGuardar: {
    marginTop: 20,
    backgroundColor: '#34C759',
    borderRadius: 10,
    padding: 5,
  },
  boton: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 20,
    width: '40%',
    alignItems: 'center',
  },
  botonsave: {
    backgroundColor: '#3897f0',
    padding: 10,
    borderRadius: 20,
    width: '40%',
    alignItems: 'center',
  },
  botonTexto: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  texto_dist: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 100,
  },
  horaText: {
    fontSize: 16,
    color: '#2c3e50',
    marginVertical: 5,
    textAlign: 'center',
  },
});

export default NuevaPantalla;
