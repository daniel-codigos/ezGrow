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
  console.log(espacioName);

  const handleButtonPress = (btntxt) => {
    // Aquí puedes agregar el código para manejar la acción del botón
    console.log(btntxt);
    console.log('¡El botón ha sido presionado!');
    navigation.navigate('pages/enchufes/'+btntxt, { espacioName: espacioName });
  };


  return (
    <View style={styles.container}>
      <View style={styles.cont_prin}>

        <TouchableOpacity onPress={(e) => handleButtonPress("enchufes_data")} style={styles.button}>
          <Icon2 name="plug" size={30} color="#ffffff" />
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
    justifyContent: "space-between",
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
});
