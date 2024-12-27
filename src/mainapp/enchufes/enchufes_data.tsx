import React, {useState, useEffect, useContext} from "react";
import { StyleSheet ,TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { View, Text } from 'react-native';
import {Picker} from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import { Input, Button } from 'react-native-elements';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import Modal from 'react-native-modal';
import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import ip from "../../ips.json"
import Regletas from "./regletas";
import EnchufesMenu from './EnchufesMenu';

export default function NuevaPantalla(){
  const [merossData,setMerossData] = useState({})
  const [aparatos,setAparatos] = useState({})
  const [isModalVisible_regletas,setModalVisible_regletas] = useState(false)
  const [isModalVisible_editname,setModalVisible_editname] = useState(false)
  const [isModalVisible_aparato,setModalVisible_aparato] = useState(false)
  const [apaEncon,setApaEncon] = useState('')
  const [start,setStart] = useState()
  const [email, setEmail] = useState('');
  const [regletaSelec, setRegletaSelec] = useState('');
  const [nameSelect, setNameSelect] = useState('');
  const [masterSelect, setMasterSelect] = useState('');
  const [inputValue_editname, setInputValue_editname] = useState('');
  const [inputValue_aparato, setInputValue_aparato] = useState('');
  const [channel_editname, setChannel_editname] = useState({});
  const [password, setPassword] = useState('');
  const [channelClick, setChannelClick] = useState({});
  const [isModalVisible, setModalVisible] = useState(false);
  const [rutinasModalVisible, setRutinasModalVisible] = useState(false);
  const [escenasModalVisible, setEscenasModalVisible] = useState(false);

  const hideModal = () => {
    //setRegletaSelec('')
    //setChannel_editname({})
    setModalVisible_editname(false);
    setModalVisible_aparato(false);
    //setModalVisible_regletas(false)
    //setModalVisible(false)
  };

  const route = useRoute();
  const { espacioName } = route.params;
  console.log(espacioName);

  const opcionesAparatos = [
    { label: "Bomba de riego", value: "Bomba de riego" },
    { label: "Bomba de rellenar", value: "Bomba de rellenar" },
    { label: "Bomba desagüe", value: "Bomba desague" },
    { label: "Lámpara", value: "Lampara" },
    { label: "Ventilador", value: "Ventilador" },
    { label: "Ventilador agua", value: "Ventilador agua" },
    { label: "Extractor", value: "Extractor" },
    { label: "Calefactor", value: "Calefactor" },
    { label: "Calentador agua", value: "Calentador agua" },
    { label: "Oxigenador", value: "Oxigenador" },
    { label: "Válvula desagüe", value: "Valvula desague" },
    { label: "Válvula Relleno", value: "Valvula Relleno" },
    { label: "Sensores", value: "Sensores" }
  ];


  
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
          console.log("locoooooo aqui q vamoooosss merossData")
          console.log(response.data)
          console.log(response.data.info.data)
          setMerossData(response.data)
          info_apa()
          //setStart(true)
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  };

  const info_apa = async () => {
    //reemplazar en api los names de los enchufes por los de la db...
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const fin = {'space':espacioName}
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/info_aparatos', {fin},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data.info)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        if ('Error' in response.data) {
          console.log('errorraMEEENNN jajaja')
          setStart(false)
          setAparatos('NoUser')
        }else{
          console.log("tu k de k e k k k ")
          console.log(response.data.info)
          setAparatos(response.data.info)
          setStart(true)
        }
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  };
  let menu_accion_enchufe = (master,name,infoMaster,numChannel,status) => {
    console.log(master)
    console.log(name)
    let type
    let accion
    console.log(status)
    console.log(infoMaster)
    for (let index = 0; index < infoMaster.info.data.length; index++) {
      const element = infoMaster.info.data[index].name;
      console.log(element)
      if (element === name) {
        type = infoMaster.info.data[index].type
      }
    }
    if (status) {
      accion = 'off'
    }else{
      accion = 'on'
    }
    const final = {"regleta":master,"name":name,"channel":numChannel,'estado':status,'accion':accion,'space':espacioName}
    console.log(final)
    action_enchufes(final)
    return 'fin'
  }

  let menu_enchufe = (master,name,numChannel,status) => {
    setChannelClick({})
    console.log(master)
    console.log(name)
    setNameSelect(name)
    setMasterSelect(master)
    const fin = {"name":name,"regleta":master,"numChannel":numChannel,"status":status}
    setChannelClick(fin);
    toggleMenu(false)
    //toggleModal()
  }
  
  const toggleMenu = (estado) => {
    const aparatoEncontrado = aparatos.find(aparato => 
      aparato.info.regleta === channelClick.regleta && 
      aparato.info.numChannel === channelClick.numChannel
    );
    setApaEncon(aparatoEncontrado)
    if (estado) {
      setChannelClick({})
    }
    setModalVisible(!isModalVisible)
    console.log(channelClick)
  }


  const actualizarEstado = (regleta, channel) => {
    setMerossData(prevState => {
      // Clonar el objeto original
      const nuevoMerossData = { ...prevState };
      // Clonar el objeto status
      const nuevoStatus = { ...prevState.info.status };

      if (nuevoStatus[regleta]) {
        console.log(nuevoStatus[regleta][channel])
        if (nuevoStatus[regleta][channel]['status']) {
          nuevoStatus[regleta][channel]['status'] = false
        }else{
          nuevoStatus[regleta][channel]['status'] = true
        }
      }
      
      // Actualizar el objeto status dentro del nuevoMerossData
      nuevoMerossData.info.status = nuevoStatus;
      
      return nuevoMerossData;
    });
  };

  const action_enchufes = async (finalInfo) => {
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      console.log("jajajajajajaj jajajajaj jejwekfjbndkjfsdkljnfkasdjfjka")
      console.log(finalInfo)
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/usar_enchufes', {finalInfo},{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        console.log(response.data)
        console.log("todo okkkkkk")
        console.log(channelClick)
        setChannelClick(prevState => ({
          ...prevState,
          status: !prevState.status
        }));
        actualizarEstado(response.data.regleta,response.data.channel)
        console.log(merossData.info.status)
        console.log(merossData)
        //setMerossData(response.data)
        //setStart(true)
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  };


  const save_meross_login = async () => {
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/save_meross', {"email":email,"passwd":password,'space':espacioName},{
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

  const change_name = async (newName) => {
    //channel_editname es {"numChannel": 3, "old_name": "Switch 3", "regleta": "regleta1"}
    console.log(channel_editname)
    console.log(newName)
    const fin = {'old_name':channel_editname.old_name,'new_name':newName,'regleta':channel_editname.regleta,'numChannel':channel_editname.numChannel,'space':espacioName}
    console.log(fin)
    //llamada a api para cambiar name.
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/editname_enchufes', fin,{
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
        setChannelClick(prevState => ({
          ...prevState,
          name: newName // Asume que 'newName' es el nombre actualizado que quieres mostrar
        }));
        setChannel_editname({}); // Si también necesitas resetear este estado
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  }


  const deleteApa = async (regleta, name, num) => {
    console.log(regleta)
    console.log(name)
    console.log(num)
    const fin = {'regleta':regleta,'numChannel':num,'aparato':name,'space':espacioName}
    console.log(fin)

    //llamada a api para cambiar tipo de aparato.
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/del_aparato', fin,{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        //setMerossData(response.data)
        console.log("aquiii esto es delete primiko")

        //merossData.info.aparatos
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  }

  const change_aparato = async (newAparato) => {
    //channel_editname es {"numChannel": 3, "old_name": "Switch 3", "regleta": "regleta1"}
    console.log(channel_editname)
    console.log(newAparato)
    const fin = {'regleta':channel_editname.regleta,'numChannel':channel_editname.numChannel,'aparato':newAparato,'space':espacioName}
    console.log(fin)

    //llamada a api para cambiar tipo de aparato.
    try {
      const token = await SecureStore.getItemAsync("token_ez")
      const response = await axios.post('http://'+ip['ips']['elegido']+'/api/pages/tipo_aparato_enchufes', fin,{
        headers: {
          'Authorization': `Bearer ${String(JSON.parse(token).access)}`,
        }
      });
      console.log(await response.data)
      //navigation.navigate('(tabs)');
      console.log(response.status)
      if (response.status === 200) {
        //setMerossData(response.data)
        console.log("aquiii esto es dataaa")
        console.log(response.data.info)
        //merossData.info.aparatos
      }
      return response.data;
    } catch (error) {
      console.error('Error al verificar el token:', error);
      return null;
    }
  }



  const pop_up_change_aparato = (master,uso,numChannel) => {
    //isModalVisible_editname
    setModalVisible_aparato(true)
    setChannel_editname({'regleta':master,"new_uso":uso,"numChannel":numChannel})
    console.log(master)
    console.log(uso)
    console.log(numChannel)
  }






  const pop_up_change_name = (master,name,numChannel) => {
    //isModalVisible_editname
    setModalVisible_editname(true)
    setChannel_editname({'regleta':master,"old_name":name,"numChannel":numChannel})
    console.log(master)
    console.log(name)
    console.log(numChannel)
  }

  useEffect(() => {
    takeUser_meross();
  }, []);
  
  useEffect(() => {
    // Esta función se ejecutará cada vez que `channelClick` cambie.
    console.log(channelClick);
    // Aquí puedes poner cualquier lógica que dependa de la actualización de `channelClick`.
    // Por ejemplo, si necesitas abrir el modal después de que `channelClick` se actualice,
    // podrías mover la lógica para abrir el modal aquí.
  }, [channelClick,channel_editname]);

  const navigation = useNavigation();
  const volverAPantallaPrincipal = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {merossData !== "NoUser" && start ? (
        <View>
          <Text style={{textAlign: 'right',fontWeight:'bold',fontSize:15, color:"white"}}>Bienvenido {merossData.info.user_meross_info?.email.split('@')[0]}</Text>
          {/*aqui hacer un map a status y sacar en texto todos los enchufes con su nombre y status*/}
          <View>
              {Object.entries(merossData.info.status).map(([nombre, enchufes], index) => (
                  <EnchufesMenu
                  key={index}
                  nombre={nombre}
                  onPress={() => {
                    console.log(inputValue_editname);
                    console.log(nombre);
                    console.log(merossData.info.status[nombre]);
                    setRegletaSelec(nombre);
                    setModalVisible_regletas(true);
                  }}
                />
              ))}

              <View>
              <Regletas
                isVisible={isModalVisible_regletas}
                onClose={() => setModalVisible_regletas(false)}
                merossData={merossData}
                regletaSelec={regletaSelec}
                menu_accion_enchufe={menu_accion_enchufe}
                menu_enchufe={menu_enchufe}
                setRutinasModalVisible={setRutinasModalVisible}
                setEscenasModalVisible={setEscenasModalVisible}
                rutinasModalVisible={rutinasModalVisible}
                espacioName={espacioName}
              />
              </View>



              <View>
                <Modal isVisible={isModalVisible}>
                  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                  <Text style={[styles.cada_ench, {backgroundColor: channelClick.status ? 'green' : 'red'}]}>
                                    <Icon name="signal" size={23} color="#ffffff" />
                                  </Text>
                                  <Text style={{color:"red",fontSize:26}}>{channelClick.regleta}</Text>
                                  <Text style={{color:"green",fontSize:26}}>{channelClick.name}</Text>
                                  {
                                  aparatos.map((aparatos,numApa) => (
                                    aparatos.info.regleta === channelClick.regleta && aparatos.info.numChannel === channelClick.numChannel ?
                                      <Text style={{color:"blue",fontSize:26}}>{aparatos.info.aparato}</Text>
                                    :
                                    null
                                  ))
                                }
                                  <Text style={{color:"black",fontSize:26,backgroundColor:'white',borderRadius:10, marginTop:10}} onPress={(e) => pop_up_change_name(channelClick.regleta,channelClick.name,channelClick.numChannel)}>Cambiar nombre</Text>
                                  <Text style={{color:"black",fontSize:26,backgroundColor:'white',borderRadius:5, marginTop:10}} onPress={(e) => pop_up_change_aparato(channelClick.regleta,channelClick.name,channelClick.numChannel)}>Set Aparato</Text>
                                  <Text style={{color:"white",fontSize:26,borderRadius:10, marginTop:10,backgroundColor: channelClick.status ? 'red' : 'green'}} onPress={(e) => menu_accion_enchufe(channelClick.regleta, channelClick.name, merossData,channelClick.numChannel,channelClick.status)}>{channelClick.status ? "Apagar" : "Encender"}</Text>
                                  {
                                    apaEncon &&
                                    <Text style={{color:"white",fontSize:26,backgroundColor:'red',borderRadius:5, marginTop:10}} onPress={(e) => deleteApa(channelClick.regleta,apaEncon.info.aparato,channelClick.numChannel)}>Borrar aparato</Text>
                                  }
                                  <Button style={{marginTop:20}} title="Cerrar" onPress={(e) => setModalVisible(false)} />
                  </View>
                </Modal>
              </View>
              <View>
                <Modal isVisible={isModalVisible_editname} backdropOpacity={0.5}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalText}>Ingrese un nombre:</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={inputValue_editname}
                      onChangeText={(text) => setInputValue_editname(text)}
                    />
                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          // Guardar la lógica aquí
                          console.log(inputValue_editname)
                          //aqui lo llamamos cuando terminamos
                          //new_espacio(inputValue_editname)
                          change_name(inputValue_editname)
                          hideModal();
                          setInputValue_editname("")
                        }}
                        style={styles.modalButton}
                      >
                        <Text style={styles.buttonText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          // Lógica de cancelar aquí
                          hideModal();
                        }}
                        style={styles.modalButton}
                      >
                        <Text style={styles.buttonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
                {/* MODAL PARA APARATOS */}
              <View>
                <Modal isVisible={isModalVisible_aparato} backdropOpacity={0.5}>
                  <View style={styles.modalContainer}>
                  <Text style={styles.modalText}>Seleccione un aparato:</Text>
                  <Picker
                    selectedValue={inputValue_aparato}
                    onValueChange={(itemValue, itemIndex) => setInputValue_aparato(itemValue)}
                    style={styles.modalInput}>
                    {opcionesAparatos.map((opcion, index) => (
                      <Picker.Item label={opcion.label} value={opcion.value} />
                    ))}
                  </Picker>
                    <View style={styles.modalButtonsContainer}>
                      <TouchableOpacity
                        onPress={() => {
                          // Guardar la lógica aquí
                          console.log(inputValue_aparato)
                          //aqui lo llamamos cuando terminamos
                          //new_espacio(inputValue_editname)
                          change_aparato(inputValue_aparato)
                          hideModal();
                          setInputValue_aparato("")
                        }}
                        style={styles.modalButton}
                      >
                      <Text style={styles.buttonText}>Guardar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          // Lógica de cancelar aquí
                          hideModal();
                        }}
                        style={styles.modalButton}
                      >
                        <Text style={styles.buttonText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>
          </View>
        </View>
      ) : merossData === "NoUser" ? ( // Nueva condición
          <View>
          <Text style={styles.title}>Meross Login</Text>
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            inputStyle={styles.input}
            containerStyle={styles.inputContainer}
          />
          <Input
            placeholder="Contraseña"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            inputStyle={styles.input}
            containerStyle={styles.inputContainer}
          />
          <Button
            title="Iniciar sesión"
            onPress={save_meross_login}
            buttonStyle={styles.loginButton}
          />
        </View>
      ) : (
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-start',
    backgroundColor:"#212121",
  },

  title: {
    fontSize: 20,
    fontWeight: 'bold',
    top:0,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  button: {
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    padding: 15,
    borderRadius: 15, // Bordes redondeados del botón (ajusta según lo desees)
    marginTop: 20, // Espacio superior para separar el botón del título
    textAlign:"center",
    width: 125,
    height:125,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  buttonText: {
    color: '#FFFFFF', // Color del texto del botón (puedes cambiarlo)
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:"center",
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  loginButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 12,
    borderRadius: 8,
  },


  regle_cont_prin:{
    //marginHorizontal: 20,
    marginTop:10,
    flexDirection: "row",
    //flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    borderRadius: 15
  },

  cont_titulo:{
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    
  },
  ench_titulo:{
    //backgroundColor: 'grey', // Color de fondo del botón (puedes cambiarlo)
    borderRadius: 15, // Bordes redondeados del botón (ajusta según lo desees)
    //marginTop: 5, // Espacio superior para separar el botón del título
    textAlign:"center",
    fontSize:20,
    width: 75,
    height:50,
    marginTop:20,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  modalInput: {
    //borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    width: '40%',
    alignItems: 'center',
    justifyContent: "center",
    alignContent: "center",
  },


  /*modal regleta*/

  fullScreenModal: {
    margin: 0, // Esto hace que el modal ocupe toda la anchura de la pantalla
    justifyContent: 'flex-end',
  },
  fullScreenModalContent: {
    //flexDirection:'row',
    height: '95%', // Ajusta al 95% de la altura de la pantalla
    backgroundColor: 'white', // Color opaco
    borderTopLeftRadius: 20, // Redondea las esquinas superiores izquierdas
    borderTopRightRadius: 20, // Redondea las esquinas superiores derechas
    padding: 20, // Agrega un poco de relleno alrededor del contenido
  },
  cont_prin_regletas:{
    flex:1,
    flexDirection:"row",

  },
  la_regleta_in:{

    flexWrap: "wrap",
    padding:20,
  },
  regle_cont_prin_in:{
    //marginHorizontal: 20,
    //marginTop:10,
    flexDirection: "column",

    flexWrap: "wrap",
    //justifyContent: "center",
    //alignItems: "center",
    //alignContent: "center",
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    borderRadius: 15
  },
  cont_prin_enchu:{
    //marginHorizontal: 20,
    flexDirection: "column",
    flexWrap: "wrap",
    padding:20,

    //justifyContent: "center",
    //alignItems: "flex-start",
    //alignContent: "center",
    //backgroundColor: 'grey',
  },
  cada_ench:{
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    //padding: 7,
    paddingLeft:8,
    marginBottom:50,
    flexWrap:'wrap',
    paddingTop:5,
    borderRadius: 15, // Bordes redondeados del botón (ajusta según lo desees)
    //marginTop: 20, // Espacio superior para separar el botón del título
    width: 50,
    height:50,

  },
  cada_pen_edit:{
    //backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    //padding: 7,
    //backgroundColor:'red',
    paddingLeft:20,
    //marginBottom:10,
    marginLeft:5,
    flexWrap:'wrap',
    paddingTop:8,
    borderRadius: 15, // Bordes redondeados del botón (ajusta según lo desees)
    //marginTop: 20, // Espacio superior para separar el botón del título
    width: 40,
    height:40,

  },
  cont_names_ench:{
    flexDirection:"column",
    paddingTop:60,
  },
  cada_ench_data:{
    backgroundColor: '#007AFF', // Color de fondo del botón (puedes cambiarlo)
    //padding: 7,
    marginTop:10,
    padding:8,
    marginBottom:50,
    flexWrap:'wrap',
    borderRadius: 5, // Bordes redondeados del botón (ajusta según lo desees)
    alignItems: 'center',
    justifyContent: "center",
    alignContent: "center",


  },
  btn_rutinas:{
    justifyContent:"center",
    alignItems:"center",
    alignContent:"flex-end",
    marginBottom:10,

  },
});