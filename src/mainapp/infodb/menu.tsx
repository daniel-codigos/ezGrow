import { StyleSheet ,TouchableOpacity, Text, View } from 'react-native';


import { useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome'; // Reemplaza 'FontAwesome' con el conjunto de iconos que desees usar
import Icon2 from 'react-native-vector-icons/FontAwesome5';
import Icon3 from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';

export default function TabOneScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { espacioName } = route.params;
  console.log('esoacui')
  console.log(espacioName);

  const handleButtonPress = (btntxt) => {
    // Aquí puedes agregar el código para manejar la acción del botón rgstr_ofi
    console.log(btntxt);
    console.log('¡El botón ha sido presionado!');
    console.log(espacioName)
    navigation.navigate('DatosRegistrados', { "espacioName": espacioName, "btnName":btntxt});
  };


  return (
    <View style={styles.container}>
      <Text>Dentro de:{espacioName}</Text>
      <View style={styles.cont_prin}>
        
        <TouchableOpacity onPress={(e) => handleButtonPress("DatosRelleno")} style={styles.button}>
          <Icon name="plug" size={30} color="#ffffff" />
          <Text style={styles.txtEnchufes}>Datos Relleno</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={(e) => handleButtonPress("DatosRiego")} style={styles.button}>
          <Icon2 name="hand-holding-water" size={30} color="#ffffff" />
          <Text style={styles.txtEnchufes}>Datos Riego</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={(e) => handleButtonPress("DatosLuz")} style={styles.button}>
          <Icon2 name="lightbulb" size={35} color="#ffffff" />
          <Text style={styles.txtEnchufes}>Datos Luz</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={(e) => handleButtonPress("DatosVenti")} style={styles.button}>
          <Icon2 name="temperature-low" size={30} color="#ffffff" />
          <Text style={styles.txtEnchufes}>Datos Ventilacion</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={(e) => handleButtonPress("DatosRutina")} style={styles.button}>
          <Icon2 name="camera-retro" size={30} color="#ffffff" />
          <Text style={styles.txtEnchufes}>Datos rutinas</Text>
        </TouchableOpacity>


      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cont_prin:{
    marginHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    alignItems: "center",
    alignContent: "flex-start"
    //borderWidth: 2, // Ancho del borde en píxeles
    //borderColor: 'black', // Color del borde (puedes usar cualquier color válido)
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
  txtEnchufes:{
    color:'white',
    marginTop:10,
    fontWeight: "bold",
    fontSize:15,

  },
});
